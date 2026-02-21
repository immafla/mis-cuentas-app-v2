import React, { FC } from "react";
import { Modal } from "@/components/Modal";
import styles from "./styles.module.css";
import {
  FormHelperText,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Box,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { NewProductModalProps } from "./types";
import { useNewProductModal } from "./hooks/useNewProductModal";

export const NewProductModal: FC<NewProductModalProps> = ({
  columns,
  open,
  onClose,
  onSubmit,
  existingProductNames,
}) => {
  const {
    brandList,
    bussinesCategoryList,
    brandSelected,
    categorySelected,
    values,
    errors,
    formColumns,
    onSubmitModal,
    handleFieldChange,
    handleBrandChange,
    handleCategoryChange,
  } = useNewProductModal({ columns, existingProductNames, onSubmit });

  return (
    <Modal open={open} onClose={onClose} onSubmit={onSubmitModal} title="Crear nuevo producto">
      <Box className={styles.container}>
        <FormControl fullWidth error={Boolean(errors.category)}>
          <InputLabel id="category-label">Categoría / Tipo de Licor</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            value={categorySelected}
            label="Categoría / Tipo de Licor"
            onChange={(event) => {
              handleCategoryChange(String(event.target.value));
            }}
          >
            {bussinesCategoryList.map((element) => (
              <MenuItem key={element.value} value={element.value}>
                {element.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.category}</FormHelperText>
        </FormControl>
        <FormControl fullWidth error={Boolean(errors.brand)}>
          <InputLabel id="brand-label">Marca / Fabricante</InputLabel>
          <Select
            labelId="brand-label"
            id="brand"
            value={brandSelected}
            label="Marca / Fabricante"
            onChange={(event) => {
              handleBrandChange(String(event.target.value));
            }}
          >
            {brandList.map((element) => (
              <MenuItem key={element.value} value={element.value}>
                {element.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.brand}</FormHelperText>
        </FormControl>
        {formColumns.map((column) => {
          const key = String(column.accessorKey ?? "");

          return column.accessorKey == "sale_price" ? (
            <FormControl
              key={key}
              fullWidth
              className={column.accessorKey as string}
              id={column.accessorKey as string}
            >
              <InputLabel htmlFor="outlined-adornment-amount">{column.header}</InputLabel>
              <OutlinedInput
                id={column.accessorKey as string}
                name={column.accessorKey as string}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                label={column.header}
                value={values[key] ?? ""}
                error={Boolean(errors[key])}
                onChange={(e) => {
                  const { name, value } = e.target;
                  handleFieldChange(name, value);
                }}
              />
              <FormHelperText error>{errors[key]}</FormHelperText>
            </FormControl>
          ) : column.accessorKey == "content" ? (
            <FormControl
              key={key}
              fullWidth
              className={column.accessorKey as string}
              id={column.accessorKey as string}
            >
              <InputLabel htmlFor="outlined-adornment-content">{column.header}</InputLabel>
              <OutlinedInput
                id={column.accessorKey as string}
                name={column.accessorKey as string}
                type="number"
                endAdornment={<InputAdornment position="end">ml</InputAdornment>}
                label={column.header}
                value={values[key] ?? ""}
                error={Boolean(errors[key])}
                onChange={(e) => {
                  const { name, value } = e.target;
                  handleFieldChange(name, value);
                }}
              />
              <FormHelperText error>{errors[key]}</FormHelperText>
            </FormControl>
          ) : (
            <TextField
              className={column.accessorKey as string}
              key={key}
              id={column.accessorKey as string}
              label={column.header}
              name={column.accessorKey as string}
              variant="outlined"
              value={values[key] ?? ""}
              error={Boolean(errors[key])}
              helperText={errors[key] ?? ""}
              onChange={(e) => {
                const { name, value } = e.target;
                handleFieldChange(name, value);
              }}
            />
          );
        })}
      </Box>
    </Modal>
  );
};
