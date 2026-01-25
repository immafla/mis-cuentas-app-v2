/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Box, MenuItem } from "@mui/material";
import Chip from "@mui/material/Chip";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
    MRT_ColumnDef,
  } from 'material-react-table';

export const productColumns = (
  brands: any[],
  categories: any[],
  getCommonEditTextFieldProps: any,
  addItemsToInventary: (data: any) => void,
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
      muiEditTextFieldProps: {
        variant: "outlined",
        select: true, //change to select for a dropdown
        children: brands.map((brand) => (
          <MenuItem key={brand._id} value={brand.name}>
            {brand.name}
          </MenuItem>
        )),
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
      Cell: (props: any) => (
        <AmountCell
          value={props.cell.getValue() as number}
          onAddItems={() => addItemsToInventary(props.cell.row.original)}
        />
      ),
    },
    {
      accessorKey: "category",
      header: "Categoria",
      size: 40,
      muiEditTextFieldProps: {
        variant: "outlined",
        select: true, //change to select for a dropdown
        children: categories.map((category) => (
          <MenuItem key={category._id} value={category.name}>
            {category.name}
          </MenuItem>
        )),
      },
    },
    // {
    //   accessorKey: 'purchase_price',
    //   header: 'Precio de compra',
    //   size: 20,
    //   muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
    // 		variant:"outlined",
    //     ...getCommonEditTextFieldProps(cell),
    //     type: 'number',
    //   }),
    // 	Cell: ({ cell }) => (
    // 		<Box>
    // 			{cell.getValue<number>()?.toLocaleString?.('es-CO', {
    // 				style: 'currency',
    // 				currency: 'COP',
    // 				minimumFractionDigits: 0,
    // 				maximumFractionDigits: 0,
    // 			})}
    // 		</Box>
    // 	),
    // },
    {
      accessorKey: "sale_price",
      header: "Precio",
      size: 20,
      muiEditTextFieldProps: ({ cell }: { cell: any }) => ({
        variant: "outlined",
        ...getCommonEditTextFieldProps(cell),
        type: "number",
      }),
      Cell: ({ cell }: { cell: any }) => (
        <Box>
          {(cell.getValue() as number)?.toLocaleString?.("es-CO", {
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

const AmountCell = ({
  value,
  onAddItems,
}: {
  value: number;
  onAddItems: (data: any) => void;
}) => (
  <Chip
    icon={<AddCircleIcon />}
    sx={{ minWidth: "4rem", cursor: "pointer" }}
    color={
      value < 10 ? "error" : value >= 10 && value < 20 ? "warning" : "success"
    }
    label={value}
    onClick={() => onAddItems({ value })}
  />
);
