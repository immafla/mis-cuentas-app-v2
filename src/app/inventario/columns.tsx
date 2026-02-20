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
  return [
    {
      accessorKey: "name",
      header: "Nombre del producto",
      size: 140,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
      }),
    },
    {
      accessorKey: "brand",
      header: "Marca",
      size: 40,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => {
        console.log({ cell });
        return {
          variant: "outlined",
          select: true, //change to select for a dropdown
          children: brands.map((brand) => (
            <MenuItem key={brand._id} value={brand.name}>
              {brand.name}
            </MenuItem>
          )),
        };
      },
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
      accessorKey: "category",
      header: "Categoria",
      size: 40,
      enableGrouping: true,
      enableEditing: true,
      muiEditTextFieldProps: {
        variant: "outlined",
        select: true,
        children: categories.map((category) => (
          <MenuItem key={category._id} value={category.name}>
            {category.name}
          </MenuItem>
        )),
      },
      Cell: ({ cell }: { cell: any }) => {
        const categoryValue = cell.getValue();
        // Si es un ID (24 caracteres hex), buscar el nombre
        if (typeof categoryValue === "string" && categoryValue.length === 24) {
          const category = categories.find((cat) => cat._id === categoryValue);
          return <Box>{category?.name ?? categoryValue}</Box>;
        }
        // Si ya es un nombre, mostrarlo directamente
        return <Box>{categoryValue}</Box>;
      },
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
