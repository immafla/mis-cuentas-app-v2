import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ApiService } from "../../../services/api.service";
import {
  Button,
  Typography,
  DialogActions,
  DialogContent,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import CustomTable from "@/components/Table";

import CloseIcon from "@mui/icons-material/Close";
import {
  MaterialReactTableProps,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
} from "material-react-table";
import Dialog from "@mui/material/Dialog";
import { IActionsModal, Product } from "./interface";

import { NewProductModal } from "../../molecules";
import { productColumns } from "./columns";
import NewProductAmount from "@/components/molecules/modals/new-amount";

export const NewProduct = ({ open, setOpen }: IActionsModal) => {
  const apiService = new ApiService();
  const [tableData, setTableData] = useState<Product[]>([]);
  const [brands, setAllBrands] = useState<any[]>([]);
  const [categories, setAllCategories] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addAmountModalOpen, setAddAmountModalOpen] = useState(false);
  const [idProductSelected, setIdProductSelected] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const handleSaveRowEdits: MaterialReactTableProps<Product>["onEditingRowSave"] =
    async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
        tableData[row.index] = values;
        setTableData([...tableData]);
        exitEditingMode();
      }
    };

  const addItemsToInventary = (data: any) => {
    setAddAmountModalOpen(true);
    setIdProductSelected(data._id);
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = async (row: MRT_Row<any>) => {
    if (!confirm(`Are you sure you want to delete ${row.getValue("name")}`)) {
      return;
    }
    //send api delete request here, then refetch or update local table data for re-render
    await apiService.deleteProduct(row.original._id);
    tableData.splice(row.index, 1);
    setTableData([...tableData]);
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

  const handleCreateNewRow = async (values: any) => {
    try {
      setIsLoading(true);
      const productsResponse: Product[] = await (
        await apiService.setProduct(values)
      ).json();
      if (productsResponse) {
        const parseValues = {
          ...values,
          brand: parseBrand(values.brand).name,
          category: parseCategory(values.category).name,
        };
        setTableData([...tableData, parseValues]);
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      console.log("Error al guardar el producto =>", { e });
    }
  };

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () =>
      productColumns(
        brands,
        categories,
        getCommonEditTextFieldProps,
        addItemsToInventary,
      ),
    [getCommonEditTextFieldProps, brands, categories, validationErrors],
  );

  const parseBrand = (brandCode: string) => {
    return brands.find((brand) => brand._id == brandCode);
  };

  const parseCategory = (categoryCode: string) => {
    return categories.find((category) => category._id == categoryCode);
  };

  const fetchListProducts = async () => {
    try {
      setIsLoading(true);
      const products = await (await apiService.getAllProducts()).json();
      const productsParsed = products.map((element: Product) => {
        return {
          ...element,
          brand: parseBrand(element.brand).name,
          category: parseCategory(element.category).name,
        };
      });
      setTableData(productsParsed);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.log("Error al obtener la lista de productos =>", { e });
    }
  };

  const getAllBrands = async () => {
    try {
      const brands = await (await apiService.getAllBrands()).json();
      setAllBrands(brands);
    } catch (e) {
      console.log("Error al obtener las marcas =>", { e });
    }
  };

  const getAllCategories = async () => {
    try {
      const categoriesList = await (
        await apiService.getAllBussinesCategory()
      ).json();
      console.log("categoriesList =>", { categoriesList });
      setAllCategories(categoriesList);
    } catch (e) {
      console.log("Error al obtener las marcas =>", { e });
    }
  };

  useEffect(() => {
    getAllBrands();
    getAllCategories();
  }, []);

  useEffect(() => {
    if (brands.length && categories.length) fetchListProducts();
  }, [brands, categories]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen()}
      fullWidth={true}
      maxWidth={"xl"}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={setOpen}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Inventario
          </Typography>
        </Toolbar>
      </AppBar>

      <DialogContent>
        <CustomTable
          columns={columns}
          tableData={tableData}
          isLoading={isLoading}
          handleSaveRowEdits={handleSaveRowEdits}
          handleCancelRowEdits={handleCancelRowEdits}
          handleDeleteRow={handleDeleteRow}
          setCreateModalOpen={setCreateModalOpen}
        />

        <NewProductModal
          columns={columns}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateNewRow}
        />
        <NewProductAmount
          idProduct={idProductSelected}
          open={addAmountModalOpen}
          onClose={() => setAddAmountModalOpen(false)}
          onSubmit={fetchListProducts}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => setOpen()}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
