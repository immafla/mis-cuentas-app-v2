"use client";

import { MRT_ColumnDef } from "material-react-table";

export type CategoryTableRow = {
  _id?: string;
  name: string;
};

export const categoryColumns = (
  getCommonEditTextFieldProps: (cell: unknown) => Record<string, unknown>,
): MRT_ColumnDef<CategoryTableRow>[] => [
  {
    accessorKey: "name",
    header: "Nombre de la categoría",
    size: 250,
    muiEditTextFieldProps: ({ cell }: { cell: unknown }) => ({
      variant: "outlined",
      ...getCommonEditTextFieldProps(cell),
    }),
  },
];
