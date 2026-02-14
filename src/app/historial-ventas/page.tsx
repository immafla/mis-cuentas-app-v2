"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import CustomTable from "@/components/Table";
import { deleteSaleById, getSalesHistory } from "@/services/sales.service";

const MySwal = withReactContent(Swal);

type SaleHistoryRow = {
  _id: string;
  soldAt: string;
  total: number;
  totalItems: number;
  products: string;
};

export default function HistorialVentasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<SaleHistoryRow[]>([]);

  const loadSales = useCallback(async () => {
    const result = await getSalesHistory(300);

    if (result.success) {
      setTableData(result.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const columns = useMemo<MRT_ColumnDef<SaleHistoryRow>[]>(
    () => [
      {
        accessorKey: "soldAt",
        header: "Fecha y hora",
        size: 180,
        Cell: ({ cell }) => new Date(String(cell.getValue())).toLocaleString("es-CO"),
      },
      {
        accessorKey: "products",
        header: "Productos vendidos",
        size: 360,
      },
      {
        accessorKey: "totalItems",
        header: "Items",
        size: 80,
      },
      {
        accessorKey: "total",
        header: "Total",
        size: 120,
        Cell: ({ cell }) => `$ ${Number(cell.getValue() ?? 0).toLocaleString("es-CO")}`,
      },
    ],
    [],
  );

  const handleDeleteRow = useCallback(async (row: MRT_Row<SaleHistoryRow>) => {
    const confirmDelete = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar venta?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    const result = await deleteSaleById(row.original._id);

    if (!result.success) {
      await MySwal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: result.message ?? result.error ?? "No fue posible eliminar la venta.",
      });
      return;
    }

    setTableData((prev) => prev.filter((item) => item._id !== row.original._id));
    await MySwal.fire({
      icon: "success",
      title: "Venta eliminada",
      timer: 1400,
      showConfirmButton: false,
    });
  }, []);

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
              Historial de ventas
            </Typography>
            <Typography color="text.secondary">Listado y gestión de ventas registradas.</Typography>
          </Box>

          <CustomTable
            columns={columns}
            tableData={tableData}
            isLoading={isLoading}
            handleSaveRowEdits={async () => {}}
            handleCancelRowEdits={() => {}}
            handleDeleteRow={handleDeleteRow}
            setCreateModalOpen={() => {}}
            showCreateButton={false}
            showEditAction={false}
            actionsHeader="Eliminar venta"
            searchPlaceholder="Buscar ventas"
          />
        </Stack>
      </Container>
    </Box>
  );
}
