"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { MaterialReactTableProps, MRT_Cell, MRT_Row } from "material-react-table";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import CustomTable from "@/components/Table";
import { validateRequired } from "@/utils";
import {
  createSupplier,
  deleteSupplierById,
  getAllSuppliers,
  updateSupplierById,
} from "@/services/suppliers.service";
import { NewSupplierModal } from "./components/new-supplier";
import { supplierColumns, SupplierTableRow } from "./columns";

const MySwal = withReactContent(Swal);

const ProveedoresPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<SupplierTableRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const result = await getAllSuppliers();
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

  const handleSaveRowEdits: MaterialReactTableProps<SupplierTableRow>["onEditingRowSave"] = async ({
    exitEditingMode,
    row,
    values,
  }) => {
    if (Object.keys(validationErrors).length) {
      await MySwal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Revisa los campos antes de guardar.",
      });
      return;
    }

    const result = await updateSupplierById(String(row.original._id ?? ""), {
      name: String(values.name ?? ""),
      nit: String(values.nit ?? ""),
    });

    if (!result.success || !result.data) {
      await MySwal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: result.message ?? result.error ?? "No fue posible actualizar el proveedor.",
      });
      return;
    }

    setTableData((prev) => prev.map((item, index) => (index === row.index ? result.data : item)));
    exitEditingMode();
    await MySwal.fire({
      icon: "success",
      title: "Proveedor actualizado",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const handleDeleteRow = useCallback(async (row: MRT_Row<SupplierTableRow>) => {
    const confirmDelete = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar proveedor?",
      text: `Se eliminará ${row.getValue("name")}.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    const result = await deleteSupplierById(String(row.original._id ?? ""));

    if (!result.success) {
      await MySwal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: result.message ?? result.error ?? "No fue posible eliminar el proveedor.",
      });
      return;
    }

    setTableData((prev) => prev.filter((_, index) => index !== row.index));
    await MySwal.fire({
      icon: "success",
      title: "Proveedor eliminado",
      timer: 1400,
      showConfirmButton: false,
    });
  }, []);

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const getCommonEditTextFieldProps = useCallback(
    (cell: unknown) => {
      const typedCell = cell as MRT_Cell<SupplierTableRow>;
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

  const handleCreateSupplier = useCallback(async (values: { name: string; nit: string }) => {
    if (!values.name || !values.nit) {
      await MySwal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Debes ingresar nombre y NIT.",
      });
      return;
    }

    const result = await createSupplier(values.name, values.nit);

    if (!result.success || !result.data) {
      await MySwal.fire({
        icon: "error",
        title: "Error al crear",
        text: result.message ?? result.error ?? "No fue posible crear el proveedor.",
      });
      return;
    }

    setTableData((prev) => [...prev, result.data]);
    setCreateModalOpen(false);
    await MySwal.fire({
      icon: "success",
      title: "Proveedor creado",
      timer: 1400,
      showConfirmButton: false,
    });
  }, []);

  const columns = useMemo(
    () => supplierColumns(getCommonEditTextFieldProps),
    [getCommonEditTextFieldProps],
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ py: 0, px: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Stack spacing={0} sx={{ flex: 1, minHeight: 0 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Proveedores
            </Typography>
            <Typography color="text.secondary">Gestiona proveedores y su NIT.</Typography>
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

          <NewSupplierModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateSupplier}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default ProveedoresPage;
