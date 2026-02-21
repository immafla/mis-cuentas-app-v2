import React, { FC } from "react";
import { Modal } from "@/components/Modal";
import styles from "./styles.module.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Autocomplete,
  FormHelperText,
  TextField,
  FormControl,
  InputLabel,
  Box,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { NewProductModalProps } from "./types";
import { useNewProductModal } from "./hooks/useNewProductModal";

const MySwal = withReactContent(Swal);

export const NewProductModal: FC<NewProductModalProps> = ({ columns, open, onClose, onSubmit }) => {
  const {
    brandList,
    bussinesCategoryList,
    brandSelected,
    categorySelected,
    isFormDirty,
    values,
    errors,
    formColumns,
    onSubmitModal,
    handleFieldChange,
    handleBrandChange,
    handleCategoryChange,
  } = useNewProductModal({ columns, onSubmit });

  const handleAttemptClose = async () => {
    if (!isFormDirty) {
      return true;
    }

    const result = await MySwal.fire({
      icon: "warning",
      title: "Salir sin guardar",
      text: "Tienes cambios sin guardar. ¿Realmente deseas salir?",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "No, continuar",
      confirmButtonColor: "#d33",
      didOpen: (popup) => {
        popup.parentElement?.style.setProperty("z-index", "1600");
      },
    });

    return result.isConfirmed;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onAttemptClose={handleAttemptClose}
      onSubmit={onSubmitModal}
      title="Crear nuevo producto"
    >
      <Box className={styles.container}>
        <Autocomplete
          options={bussinesCategoryList}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          value={bussinesCategoryList.find((option) => option.value === categorySelected) ?? null}
          onChange={(_, selectedOption) => {
            handleCategoryChange(selectedOption?.value ?? "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categoría / Tipo de Licor"
              error={Boolean(errors.category)}
              helperText={errors.category ?? ""}
            />
          )}
        />
        <Autocomplete
          options={brandList}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          value={brandList.find((option) => option.value === brandSelected) ?? null}
          onChange={(_, selectedOption) => {
            handleBrandChange(selectedOption?.value ?? "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Marca / Fabricante"
              error={Boolean(errors.brand)}
              helperText={errors.brand ?? ""}
            />
          )}
        />
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
