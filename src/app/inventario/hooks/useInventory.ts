"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialReactTableProps, MRT_Cell, MRT_ColumnDef, MRT_Row } from "material-react-table";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { getAllBrands } from "@/services/brands.service";
import { getAllCategories } from "@/services/categories.service";
import {
  createProduct,
  deleteProductById,
  getAllProducts,
  updateProductById,
} from "@/services/products.service";
import { productColumns } from "../columns";

const MySwal = withReactContent(Swal);

export type Product = {
  bar_code: string;
  name: string;
  brand: string;
  category: string;
  content?: string | number;
  sale_price: string | number;
  amount?: number;
};

type Brand = {
  _id: string;
  name: string;
};

type Category = {
  _id: string;
  name: string;
};

export type ProductWithId = Product & { _id: string };

const mapProduct = (product: ProductWithId) => ({
  ...product,
  sale_price: Number(product.sale_price ?? 0),
});

export const useInventory = () => {
  const [tableData, setTableData] = useState<ProductWithId[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchListProducts = useCallback(async (brandList: Brand[], categoryList: Category[]) => {
    try {
      setIsLoading(true);

      const productsResult = await getAllProducts();
      if (!productsResult.success || !productsResult.data) {
        throw new Error(
          productsResult.message ?? productsResult.error ?? "No fue posible obtener productos.",
        );
      }

      const products: ProductWithId[] = productsResult.data as ProductWithId[];
      const brandNameById = new Map(
        brandList.map((brand) => [String(brand._id), String(brand.name)]),
      );
      const categoryNameById = new Map(
        categoryList.map((category) => [String(category._id), String(category.name)]),
      );

      const productsParsed = products
        .map((element) => mapProduct(element))
        .sort((a, b) => {
          const categoryA =
            categoryNameById.get(String(a.category ?? "")) ?? String(a.category ?? "");
          const categoryB =
            categoryNameById.get(String(b.category ?? "")) ?? String(b.category ?? "");
          const catCompare = categoryA.localeCompare(categoryB, "es");
          if (catCompare !== 0) return catCompare;

          const brandA = brandNameById.get(String(a.brand ?? "")) ?? String(a.brand ?? "");
          const brandB = brandNameById.get(String(b.brand ?? "")) ?? String(b.brand ?? "");
          const brandCompare = brandA.localeCompare(brandB, "es");
          if (brandCompare !== 0) return brandCompare;

          return String(a.name ?? "").localeCompare(String(b.name ?? ""), "es");
        });
      setTableData(productsParsed);
    } catch (error) {
      console.log("Error al obtener la lista de productos =>", { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchListProductsCurrent = useCallback(async () => {
    await fetchListProducts(brands, categories);
  }, [brands, categories, fetchListProducts]);

  const handleSaveRowEdits: MaterialReactTableProps<ProductWithId>["onEditingRowSave"] =
    useCallback(
      async ({
        exitEditingMode,
        row,
        values,
      }: Parameters<
        NonNullable<MaterialReactTableProps<ProductWithId>["onEditingRowSave"]>
      >[0]) => {
        if (Object.keys(validationErrors).length) {
          await MySwal.fire({
            icon: "warning",
            title: "Campos inválidos",
            text: "Revisa los campos antes de guardar.",
          });
          return;
        }

        const productId = row.original._id;

        if (!productId) {
          await MySwal.fire({
            icon: "error",
            title: "No se pudo actualizar",
            text: "No se encontró el id del producto para actualizar.",
          });
          return;
        }

        const brandId = String(values.brand ?? "");
        const categoryId = String(values.category ?? "");

        const payload = {
          name: String(values.name ?? ""),
          brand: brandId,
          category: categoryId,
          content: String(values.content ?? "").trim(),
          sale_price: String(values.sale_price ?? 0),
          bar_code: String(values.bar_code ?? ""),
        };

        const result = await updateProductById(productId, payload);

        if (!result.success) {
          await MySwal.fire({
            icon: "error",
            title: "Error al actualizar",
            text: result.message ?? result.error ?? "No fue posible actualizar el producto.",
          });
          return;
        }

        await fetchListProductsCurrent();
        exitEditingMode();
        await new Promise((resolve) => setTimeout(resolve, 180));
        await MySwal.fire({
          icon: "success",
          title: "Producto actualizado",
          text: "Los cambios se guardaron correctamente.",
          timer: 1600,
          showConfirmButton: false,
        });
      },
      [fetchListProductsCurrent, validationErrors],
    );

  const handleCancelRowEdits = useCallback(() => {
    setValidationErrors({});
  }, []);

  const handleDeleteRow = useCallback(async (row: MRT_Row<ProductWithId>) => {
    const confirmDelete = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar producto?",
      text: `Se eliminará ${row.getValue("name")}. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    try {
      const response = await deleteProductById(String(row.original._id ?? ""));

      if (!response.success) {
        throw new Error(
          response.message ?? response.error ?? "No fue posible eliminar el producto.",
        );
      }

      setTableData((prev) => prev.filter((_, index) => index !== row.index));
      await MySwal.fire({
        icon: "success",
        title: "Producto eliminado",
        text: "El producto se eliminó correctamente.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      await MySwal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error instanceof Error ? error.message : "No fue posible eliminar el producto.",
      });
    }
  }, []);

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<ProductWithId>) => ({
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
    }),
    [validationErrors],
  );

  const handleCreateNewRow = useCallback(
    async (values: Product) => {
      try {
        const normalizedName = String(values.name ?? "")
          .trim()
          .replaceAll(/\s+/g, " ")
          .toUpperCase();
        const hasRequiredFields =
          normalizedName.length > 0 &&
          String(values.bar_code ?? "").trim().length > 0 &&
          String(values.sale_price ?? "").trim().length > 0 &&
          String(values.brand ?? "").trim().length > 0 &&
          String(values.category ?? "").trim().length > 0;

        if (!hasRequiredFields) {
          await MySwal.fire({
            icon: "warning",
            title: "Campos requeridos",
            text: "Completa todos los campos obligatorios antes de guardar.",
          });
          return;
        }

        setIsLoading(true);
        const result = await createProduct({
          ...values,
          name: normalizedName,
          sale_price: String(Number(values.sale_price ?? 0)),
        });

        if (!result.success) {
          throw new Error(result.message ?? result.error ?? "No fue posible crear el producto.");
        }

        await fetchListProductsCurrent();
        setCreateModalOpen(false);
        await MySwal.fire({
          icon: "success",
          title: "Producto creado",
          text: "El nuevo producto se guardó correctamente.",
          timer: 1600,
          showConfirmButton: false,
        });
      } catch (error) {
        await MySwal.fire({
          icon: "error",
          title: "Error al crear",
          text: error instanceof Error ? error.message : "No fue posible crear el producto.",
        });
        console.log("Error al guardar el producto =>", { error });
      } finally {
        setIsLoading(false);
      }
    },
    [fetchListProductsCurrent],
  );

  const columns = useMemo<MRT_ColumnDef<ProductWithId>[]>(
    () => productColumns(brands, categories, getCommonEditTextFieldProps),
    [brands, categories, getCommonEditTextFieldProps],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [brandsResult, categoriesResult] = await Promise.all([
          getAllBrands(),
          getAllCategories(),
        ]);

        if (!brandsResult.success || !categoriesResult.success) {
          throw new Error(
            brandsResult.message ??
              categoriesResult.message ??
              "No fue posible obtener marcas y categorías.",
          );
        }

        const brandList = brandsResult.data as Brand[];
        const categoryList = categoriesResult.data as Category[];

        if (!isMounted) {
          return;
        }

        const sortedBrandList = [...brandList].sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"),
        );
        const sortedCategoryList = [...categoryList].sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"),
        );
        setBrands(sortedBrandList);
        setCategories(sortedCategoryList);
        await fetchListProducts(sortedBrandList, sortedCategoryList);
      } catch (error) {
        console.log("Error al obtener las marcas =>", { error });
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchListProducts]);

  return {
    columns,
    createModalOpen,
    handleCancelRowEdits,
    handleCreateNewRow,
    handleDeleteRow,
    handleSaveRowEdits,
    isLoading,
    setCreateModalOpen,
    tableData,
    refreshProducts: fetchListProductsCurrent,
  };
};
