import { useCallback, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";

import { ApiService } from "@/services/api.service";
import { Product, ProductWithId } from "../../../hooks/useInventory";
import { ProductFormValues, SelectOption } from "../types";

type UseNewProductModalParams = {
  columns: MRT_ColumnDef<ProductWithId>[];
  existingProductNames: string[];
  onSubmit: (values: Product) => void | Promise<void>;
};

const getInitialValues = (columns: MRT_ColumnDef<ProductWithId>[]): ProductFormValues =>
  columns.reduce((acc, column) => {
    acc[String(column.accessorKey ?? "")] = "";
    return acc;
  }, {} as ProductFormValues);

export const useNewProductModal = ({
  columns,
  existingProductNames,
  onSubmit,
}: UseNewProductModalParams) => {
  const apiService = useMemo(() => new ApiService(), []);

  const [brandList, setBrandList] = useState<SelectOption[]>([]);
  const [bussinesCategoryList, setBussinesCategoryList] = useState<SelectOption[]>([]);
  const [brandSelected, setBrandSelected] = useState("");
  const [categorySelected, setCategorySelected] = useState("");
  const [values, setValues] = useState<ProductFormValues>(() => getInitialValues(columns));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formColumns = useMemo(
    () =>
      columns.filter(
        (column) =>
          column.accessorKey !== "amount" &&
          column.accessorKey !== "brand" &&
          column.accessorKey !== "category",
      ),
    [columns],
  );

  const existingNamesSet = useMemo(
    () =>
      new Set(
        existingProductNames
          .map((name) => name.trim().replaceAll(/\s+/g, " ").toUpperCase())
          .filter(Boolean),
      ),
    [existingProductNames],
  );

  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleBrandChange = useCallback((value: string) => {
    setBrandSelected(value);
    setErrors((prev) => ({ ...prev, brand: "" }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategorySelected(value);
    setErrors((prev) => ({ ...prev, category: "" }));
  }, []);

  const validateForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    formColumns.forEach((column) => {
      const key = String(column.accessorKey ?? "");
      const value = String(values[key] ?? "").trim();
      if (key !== "content" && !value) {
        nextErrors[key] = "Campo requerido";
      }
    });

    if (!brandSelected) {
      nextErrors.brand = "Marca requerida";
    }

    if (!categorySelected) {
      nextErrors.category = "Categoría requerida";
    }

    const normalizedName = String(values.name ?? "")
      .trim()
      .replaceAll(/\s+/g, " ")
      .toUpperCase();

    if (!normalizedName) {
      nextErrors.name = "Campo requerido";
    } else if (existingNamesSet.has(normalizedName)) {
      nextErrors.name = "Ya existe un producto con este nombre";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [brandSelected, categorySelected, existingNamesSet, formColumns, values]);

  const onSubmitModal = useCallback(async () => {
    const isValid = validateForm();

    if (!isValid) {
      return false;
    }

    await onSubmit({
      ...values,
      amount: 0,
      brand: brandSelected,
      category: categorySelected,
    } as Product);

    return true;
  }, [brandSelected, categorySelected, onSubmit, validateForm, values]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          apiService.getAllBrands(),
          apiService.getAllCategories(),
        ]);

        const [brandsData, categoriesData] = await Promise.all([
          brandsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!isMounted) {
          return;
        }

        setBrandList(
          Array.isArray(brandsData)
            ? brandsData.map((el: { _id: string; name: string }) => ({
                value: el._id,
                label: el.name,
              }))
            : [],
        );
        setBussinesCategoryList(
          Array.isArray(categoriesData)
            ? categoriesData.map((el: { _id: string; name: string }) => ({
                value: el._id,
                label: el.name,
              }))
            : [],
        );
      } catch (error) {
        console.log("Error al obtener listas de formulario =>", { error });
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, [apiService]);

  return {
    brandList,
    bussinesCategoryList,
    brandSelected,
    categorySelected,
    values,
    errors,
    formColumns,
    onSubmitModal,
    handleFieldChange,
    handleBrandChange,
    handleCategoryChange,
  };
};
