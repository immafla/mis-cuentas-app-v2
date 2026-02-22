"use client";

import { Box, Chip, Typography, Stack } from "@mui/material";
import { MRT_Cell, MRT_ColumnDef } from "material-react-table";

import { LotRow } from "@/services/lots.service";

export const lotsColumns = (): MRT_ColumnDef<LotRow>[] => [
  {
    accessorKey: "_id",
    header: "ID lote",
    size: 220,
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    size: 100,
    Cell: ({ row }) => {
      const active = row.original.isActive;
      return (
        <Chip
          label={active ? "Activo" : "Inactivo"}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: active ? "success.light" : "grey.400",
            color: active ? "success.contrastText" : "common.white",
          }}
        />
      );
    },
  },
  {
    accessorKey: "receivedAt",
    header: "Fecha ingreso",
    size: 120,
    Cell: ({ cell }: { cell: MRT_Cell<LotRow> }) => {
      const value = cell.getValue<LotRow["receivedAt"]>();
      return new Date(value).toLocaleDateString("es-CO");
    },
  },
  {
    accessorKey: "supplierName",
    header: "Proveedor",
    size: 160,
  },
  {
    accessorKey: "supplierNit",
    header: "NIT",
    size: 120,
  },
  {
    accessorKey: "productsCount",
    header: "Productos",
    size: 90,
  },
  {
    accessorKey: "productsSummary",
    header: "Detalle",
    size: 340,
    Cell: ({ row }) => {
      const details = row.original.productsDetails;
      if (!details?.length) return null;
      return (
        <Stack spacing={0.5}>
          {details.map((item, i) => (
            <Box key={i}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                {[item.category_name, item.brand_name, item.name].filter(Boolean).join(" · ")}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {`Restantes: ${item.remainingQuantity} · Compra: $ ${item.purchasePrice.toLocaleString("es-CO")}`}
              </Typography>
            </Box>
          ))}
        </Stack>
      );
    },
  },
  {
    accessorKey: "totalQuantity",
    header: "Cantidad total",
    size: 100,
  },
  {
    accessorKey: "totalCost",
    header: "Costo total",
    size: 120,
    Cell: ({ cell }: { cell: MRT_Cell<LotRow> }) => (
      <Box>
        {Number(cell.getValue() ?? 0).toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </Box>
    ),
  },
];
