"use client";

import { MRT_ColumnDef } from "material-react-table";

export const brandColumns = (
  getCommonEditTextFieldProps: (cell: unknown) => Record<string, unknown>,
): MRT_ColumnDef<any>[] => {
  return [
    {
      accessorKey: "name",
      header: "Nombre de la marca",
      size: 140,
      muiEditTextFieldProps: ({ cell }: { cell: unknown }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
      }),
    },
  ];
};
