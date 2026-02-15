"use client";

import { Box } from "@mui/material";
import { MRT_Cell, MRT_ColumnDef } from "material-react-table";

import { LotRow } from "@/services/lots.service";

export const lotsColumns = (): MRT_ColumnDef<LotRow>[] => [
  {
    accessorKey: "_id",
    header: "ID lote",
    size: 220,
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
    size: 260,
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
