"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { ApiService } from "../../services/api.service";
import CustomTable from "@/components/Table";
import { MaterialReactTableProps, MRT_Cell, MRT_ColumnDef, MRT_Row } from "material-react-table";

import { NewProductModal } from "./components/new-product";
import { productColumns } from "./columns";
import NewProductAmount from "@/app/inventario/components/new-amount";

export type Product = {
  bar_code: string;
  name: string;
  brand: string;
  category: string;
  purchase_price: number;
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

type ProductWithId = Product & { _id: string };

const mapProduct = (product: Product, brands: Brand[], categories: Category[]) => {
  const brandName = brands.find((brand) => brand._id === product.brand)?.name;
  const categoryName = categories.find((category) => category._id === product.category)?.name;

  return {
    ...product,
    brand: brandName ?? product.brand,
    category: categoryName ?? product.category,
  };
};

export default function InventarioPage() {
  const apiService = useMemo(() => new ApiService(), []);
  const [tableData, setTableData] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addAmountModalOpen, setAddAmountModalOpen] = useState(false);
  const [idProductSelected, setIdProductSelected] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const handleSaveRowEdits: MaterialReactTableProps<Product>["onEditingRowSave"] = async ({
    exitEditingMode,
  }) => {
    if (!Object.keys(validationErrors).length) {
      exitEditingMode();
    }
  };

  const addItemsToInventary = (data: ProductWithId) => {
    setAddAmountModalOpen(true);
    setIdProductSelected(data._id);
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = async (row: MRT_Row<ProductWithId>) => {
    if (!confirm(`Are you sure you want to delete ${row.getValue("name")}`)) {
      return;
    }
    await apiService.deleteProduct(row.original._id);
    setTableData((prev) => prev.filter((_, index) => index !== row.index));
  };

  const getCommonEditTextFieldProps = useCallback(
    (cell: MRT_Cell<Product>) => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
      };
    },
    [validationErrors],
  );

  const handleCreateNewRow = async (values: Product) => {
    try {
      setIsLoading(true);
      const productsResponse: Product[] = await (await apiService.setProduct(values)).json();
      if (productsResponse) {
        const parsed = mapProduct(values, brands, categories);
        setTableData((prev) => [...prev, parsed]);
      }
    } catch (e) {
      console.log("Error al guardar el producto =>", { e });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => productColumns(brands, categories, getCommonEditTextFieldProps, addItemsToInventary),
    [getCommonEditTextFieldProps, brands, categories],
  );

  const fetchListProducts = useCallback(
    async (brandList: Brand[] = brands, categoryList: Category[] = categories) => {
      try {
        setIsLoading(true);
        const products = await (await apiService.getAllProducts()).json();
        const productsParsed = products.map((element: Product) =>
          mapProduct(element, brandList, categoryList),
        );
        setTableData(productsParsed);
      } catch (e) {
        console.log("Error al obtener la lista de productos =>", { e });
      } finally {
        setIsLoading(false);
      }
    },
    [apiService, brands, categories],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          apiService.getAllBrands(),
          apiService.getAllBussinesCategory(),
        ]);
        const [brandList, categoryList] = await Promise.all([
          brandsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!isMounted) return;

        setBrands(brandList);
        setCategories(categoryList);
        await fetchListProducts(brandList, categoryList);
      } catch (e) {
        console.log("Error al obtener las marcas =>", { e });
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [apiService]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "screen",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Inventario
            </Typography>
            <Typography color="text.secondary">Gestiona productos y existencias.</Typography>
          </Box>
          <CustomTable
            columns={columns}
            tableData={tableData}
            isLoading={isLoading}
            handleSaveRowEdits={handleSaveRowEdits}
            handleCancelRowEdits={handleCancelRowEdits}
            handleDeleteRow={handleDeleteRow}
            setCreateModalOpen={setCreateModalOpen}
          />
          {createModalOpen && (
            <NewProductModal
              columns={columns}
              open={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              onSubmit={handleCreateNewRow}
            />
          )}

          {addAmountModalOpen && (
            <NewProductAmount
              idProduct={idProductSelected}
              open={addAmountModalOpen}
              onClose={() => setAddAmountModalOpen(false)}
              onSubmit={fetchListProducts}
            />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
