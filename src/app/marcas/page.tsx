"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";

import { validateRequired } from "../../utils";
import { brandColumns } from "./columns";
import {
  MaterialReactTableProps,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
} from "material-react-table";
import CustomTable from "@/components/Table";
import { NewBrandModal } from "./components/new-brand";

import {
  createBrand,
  deleteBrandById,
  updateBrandById,
  getAllBrands,
} from "@/services/brands.service";

type BrandRow = {
  _id?: string;
  name: string;
};

const NewBrand = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<BrandRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSaveRowEdits: MaterialReactTableProps<any>["onEditingRowSave"] =
    async ({ exitEditingMode, row, values }) => {
      if (Object.keys(validationErrors).length) {
        return;
      }

      const result = await updateBrandById(
        String(row.original._id ?? ""),
        values.name,
      );

      if (result.success && result.data) {
        setTableData((prev) =>
          prev.map((item, index) =>
            index === row.index ? { ...item, name: result.data.name } : item,
          ),
        );
      }

      exitEditingMode();
    };

  const handleDeleteRow = useCallback(async (row: MRT_Row<BrandRow>) => {
    if (!confirm(`Seguro quiere borrar la marca ${row.getValue("name")}`)) {
      return;
    }
    console.log("Deleting row with id:", row.getValue("_id"));
    const result = await deleteBrandById(String(row.original._id ?? ""));
    if (result.success) {
      setTableData((prev) => prev.filter((_, index) => index !== row.index));
    }
  }, []);

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const getCommonEditTextFieldProps = useCallback(
    (cell: unknown) => {
      const typedCell = cell as MRT_Cell<BrandRow>;
      return {
        error: !!validationErrors[typedCell.id],
        helperText: validationErrors[typedCell.id],
        onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
          const isValid = validateRequired(event.target.value);

          if (!isValid) {
            setValidationErrors((prev) => ({
              ...prev,
              [typedCell.id]: `${typedCell.column.columnDef.header} es obligatorio`,
            }));
            return;
          }

          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[typedCell.id];
            return next;
          });
        },
      };
    },
    [validationErrors],
  );

  const handleCreateNewRow = async (values: BrandRow) => {
    if (!values.name) {
      alert("El nombre es obligatorio");
      return;
    }

    setIsLoading(true);
    const result = await createBrand(values.name);

    if (result.success && result.data) {
      setTableData((prev) => [...prev, result.data]);
      setCreateModalOpen(false);
    }

    setIsLoading(false);
  };

  const columns = useMemo<MRT_ColumnDef<BrandRow>[]>(
    () => brandColumns(getCommonEditTextFieldProps),
    [getCommonEditTextFieldProps],
  );

  useEffect(() => {
    let active = true;

    (async () => {
      setIsLoading(true);
      const result = await getAllBrands();

      if (active && result.success && result.data) {
        setTableData(result.data);
      }

      if (active) {
        setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
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
              Marcas
            </Typography>
            <Typography color="text.secondary">
              Gestiona las marcas.
            </Typography>
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
          <NewBrandModal
            columns={columns}
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateNewRow}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default NewBrand;
