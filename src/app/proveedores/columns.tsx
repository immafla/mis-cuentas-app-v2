"use client";

import { MRT_ColumnDef } from "material-react-table";

export type SupplierTableRow = {
  _id?: string;
  name: string;
  nit: string;
};

export const supplierColumns = (
  getCommonEditTextFieldProps: (cell: unknown) => Record<string, unknown>,
): MRT_ColumnDef<SupplierTableRow>[] => [
  {
    accessorKey: "name",
    header: "Nombre del proveedor",
    size: 180,
    muiEditTextFieldProps: ({ cell }: { cell: unknown }) => ({
      variant: "outlined",
      ...getCommonEditTextFieldProps(cell),
    }),
  },
  {
    accessorKey: "nit",
    header: "NIT",
    size: 120,
    muiEditTextFieldProps: ({ cell }: { cell: unknown }) => ({
      variant: "outlined",
      ...getCommonEditTextFieldProps(cell),
    }),
  },
];
