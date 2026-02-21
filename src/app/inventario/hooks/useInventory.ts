"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialReactTableProps, MRT_Cell, MRT_ColumnDef, MRT_Row } from "material-react-table";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { ApiService } from "@/services/api.service";
import { createProduct, updateProductById } from "@/services/products.service";
import { productColumns } from "../columns";

const MySwal = withReactContent(Swal);

export type Product = {
  bar_code: string;
  name: string;
  brand: string;
  category: string;
  content?: string | number;
  sale_price: number;
  amount: number;
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

const mapProduct = (product: ProductWithId, brands: Brand[], categories: Category[]) => {
  const brandName = brands.find((brand) => brand._id === product.brand)?.name;
  const categoryName = categories.find((category) => category._id === product.category)?.name;

  return {
    ...product,
    sale_price: Number(product.sale_price ?? 0),
    brand: brandName ?? product.brand,
    category: categoryName ?? product.category,
  };
};

export const useInventory = () => {
  const apiService = useMemo(() => new ApiService(), []);

  const [tableData, setTableData] = useState<ProductWithId[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchListProducts = useCallback(
    async (brandList: Brand[], categoryList: Category[]) => {
      try {
        setIsLoading(true);
        const products: ProductWithId[] = await (await apiService.getAllProducts()).json();
        const productsParsed = products.map((element) =>
          mapProduct(element, brandList, categoryList),
        );
        setTableData(productsParsed);
      } catch (error) {
        console.log("Error al obtener la lista de productos =>", { error });
      } finally {
        setIsLoading(false);
      }
    },
    [apiService],
  );

  const fetchListProductsCurrent = useCallback(async () => {
    await fetchListProducts(brands, categories);
  }, [brands, categories, fetchListProducts]);

  const handleSaveRowEdits: MaterialReactTableProps<ProductWithId>["onEditingRowSave"] =
    useCallback(
      async ({ exitEditingMode, row, values }: any) => {
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

        const brandId = brands.find((brand) => brand.name === String(values.brand))?._id;
        const categoryId = categories.find(
          (category) => category.name === String(values.category),
        )?._id;

        const payload = {
          name: String(values.name ?? ""),
          brand: brandId ?? String(values.brand ?? ""),
          category: categoryId ?? String(values.category ?? ""),
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
      [brands, categories, fetchListProductsCurrent, validationErrors],
    );

  const handleCancelRowEdits = useCallback(() => {
    setValidationErrors({});
  }, []);

  const handleDeleteRow = useCallback(
    async (row: MRT_Row<ProductWithId>) => {
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
        const response = await apiService.deleteProduct(row.original._id);

        if (!response.ok) {
          throw new Error("No fue posible eliminar el producto.");
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
    },
    [apiService],
  );

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
        const [brandsResponse, categoriesResponse] = await Promise.all([
          apiService.getAllBrands(),
          apiService.getAllCategories(),
        ]);
        const [brandList, categoryList] = await Promise.all([
          brandsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!isMounted) {
          return;
        }

        setBrands(brandList);
        setCategories(categoryList);
        await fetchListProducts(brandList, categoryList);
      } catch (error) {
        console.log("Error al obtener las marcas =>", { error });
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [apiService, fetchListProducts]);

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
