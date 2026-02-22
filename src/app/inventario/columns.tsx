/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Box, MenuItem } from "@mui/material";
import Chip from "@mui/material/Chip";
import { MRT_ColumnDef } from "material-react-table";

export const productColumns = (
  brands: any[],
  categories: any[],
  getCommonEditTextFieldProps: any,
): MRT_ColumnDef<any>[] => {
  const brandNameById = new Map(brands.map((brand) => [String(brand._id), String(brand.name)]));
  const categoryNameById = new Map(
    categories.map((category) => [String(category._id), String(category.name)]),
  );

  const resolveName = (value: unknown, map: Map<string, string>) => {
    if (value === null || value === undefined) {
      return "";
    }

    const parsedValue = typeof value === "string" || typeof value === "number" ? String(value) : "";
    return map.get(parsedValue) ?? parsedValue;
  };

  return [
    {
      accessorKey: "category",
      header: "Categoria",
      size: 40,
      enableGrouping: true,
      enableEditing: true,
      muiEditTextFieldProps: {
        variant: "outlined",
        select: true,
        children: [...categories]
          .sort((a, b) => String(a.name).localeCompare(String(b.name), "es"))
          .map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.name}
            </MenuItem>
          )),
      },
      Cell: ({ cell }: { cell: any }) => {
        const categoryValue = cell.getValue();
        return <Box>{resolveName(categoryValue, categoryNameById)}</Box>;
      },
    },
    {
      accessorKey: "brand",
      header: "Marca",
      size: 40,
      enableGrouping: true,
      muiEditTextFieldProps: {
        variant: "outlined",
        select: true,
        children: [...brands]
          .sort((a, b) => String(a.name).localeCompare(String(b.name), "es"))
          .map((brand) => (
            <MenuItem key={brand._id} value={brand._id}>
              {brand.name}
            </MenuItem>
          )),
      },
      Cell: ({ cell }: { cell: any }) => {
        const brandValue = cell.getValue();
        return <Box>{resolveName(brandValue, brandNameById)}</Box>;
      },
    },
    {
      accessorKey: "name",
      header: "Nombre",
      size: 140,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
      }),
    },
    {
      accessorKey: "content",
      header: "Contenido",
      size: 140,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
      }),
    },
    {
      accessorKey: "amount",
      header: "Disponibles",
      size: 2,
      enableEditing: false,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
      }),
      Cell: (props: any) => <AmountCell value={props.cell.getValue() as number} />,
    },
    {
      accessorKey: "sale_price",
      header: "Precio de venta",
      size: 20,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
        type: "number",
      }),
      Cell: ({ cell }: { cell: any }) => (
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
    {
      accessorKey: "bar_code",
      header: "Código",
      size: 140,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
      }),
    },
  ];
};

const AmountCell = ({ value }: { value: number }) => (
  <Chip
    sx={{ minWidth: "3rem", fontWeight: 600, width: "20px" }}
    color={value < 10 ? "error" : value >= 10 && value < 20 ? "warning" : "success"}
    label={value}
  />
);
