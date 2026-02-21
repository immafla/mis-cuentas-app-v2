import React, { FC, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Modal } from "@/components/Modal";
import { SupplierRow } from "@/services/suppliers.service";
import { NewLotValues, ProductOption } from "../../hooks/useLots";

const MySwal = withReactContent(Swal);

export const NewLotModal: FC<{
  open: boolean;
  onClose: () => void;
  suppliers: SupplierRow[];
  productOptions: ProductOption[];
  onSubmit: (values: NewLotValues) => Promise<boolean>;
}> = ({ open, onClose, suppliers, productOptions, onSubmit }) => {
  type RowState = {
    rowId: string;
    selectedProduct: ProductOption | null;
    quantity: string;
    purchasePrice: string;
  };

  type RowErrorState = {
    selectedProduct?: string;
    quantity?: string;
    purchasePrice?: string;
  };

  const createRow = () => ({
    rowId: crypto.randomUUID(),
    selectedProduct: null as ProductOption | null,
    quantity: "",
    purchasePrice: "",
  });

  const initialDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [receivedAt, setReceivedAt] = useState(initialDate);
  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState<RowState[]>([createRow()]);
  const [errors, setErrors] = useState<{
    receivedAt?: string;
    supplierId?: string;
    rows: RowErrorState[];
  }>({ rows: [{}] });

  const resetForm = () => {
    setReceivedAt(initialDate);
    setSupplierId("");
    setRows([createRow()]);
    setErrors({ rows: [{}] });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSubmit = useMemo(() => {
    if (!receivedAt || !supplierId || rows.length === 0) {
      return false;
    }

    return rows.every(
      (row) =>
        Boolean(row.selectedProduct?._id) &&
        Number(row.quantity) > 0 &&
        Number(row.purchasePrice) >= 0,
    );
  }, [receivedAt, rows, supplierId]);

  const isFormDirty = useMemo(() => {
    const hasSupplier = String(supplierId).trim().length > 0;
    const hasChangedDate = receivedAt !== initialDate;
    const hasMultipleRows = rows.length > 1;
    const hasRowData = rows.some(
      (row) =>
        Boolean(row.selectedProduct?._id) ||
        String(row.quantity ?? "").trim().length > 0 ||
        String(row.purchasePrice ?? "").trim().length > 0,
    );

    return hasSupplier || hasChangedDate || hasMultipleRows || hasRowData;
  }, [initialDate, receivedAt, rows, supplierId]);

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
    });

    return result.isConfirmed;
  };

  const handleAddProductRow = () => {
    setRows((prev) => [...prev, createRow()]);
    setErrors((prev) => ({
      ...prev,
      rows: [...prev.rows, {}],
    }));
  };

  const handleRemoveProductRow = (indexToRemove: number) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((_, index) => index !== indexToRemove);
    });

    setErrors((prev) => {
      if (prev.rows.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        rows: prev.rows.filter((_, index) => index !== indexToRemove),
      };
    });
  };

  const handleChangeRow = (
    indexToUpdate: number,
    key: "selectedProduct" | "quantity" | "purchasePrice",
    value: ProductOption | string | null,
  ) => {
    setRows((prev) =>
      prev.map((row, index) => {
        if (index !== indexToUpdate) {
          return row;
        }

        return {
          ...row,
          [key]: value,
        };
      }),
    );

    setErrors((prev) => ({
      ...prev,
      rows: prev.rows.map((rowError, index) => {
        if (index !== indexToUpdate) {
          return rowError;
        }

        return {
          ...rowError,
          [key]: undefined,
        };
      }),
    }));
  };

  const validateForm = () => {
    const nextErrors: {
      receivedAt?: string;
      supplierId?: string;
      rows: RowErrorState[];
    } = {
      rows: rows.map((row) => {
        const rowErrors: RowErrorState = {};

        if (!row.selectedProduct?._id) {
          rowErrors.selectedProduct = "El producto es requerido.";
        }

        if (!String(row.quantity).trim()) {
          rowErrors.quantity = "La cantidad es requerida.";
        } else if (!Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0) {
          rowErrors.quantity = "La cantidad debe ser mayor a 0.";
        }

        if (!String(row.purchasePrice).trim()) {
          rowErrors.purchasePrice = "El precio de compra es requerido.";
        } else if (!Number.isFinite(Number(row.purchasePrice)) || Number(row.purchasePrice) < 0) {
          rowErrors.purchasePrice = "El precio de compra no puede ser negativo.";
        }

        return rowErrors;
      }),
    };

    if (!String(receivedAt).trim()) {
      nextErrors.receivedAt = "La fecha de ingreso es requerida.";
    }

    if (!String(supplierId).trim()) {
      nextErrors.supplierId = "El proveedor es requerido.";
    }

    const hasRowErrors = nextErrors.rows.some(
      (rowError) => rowError.selectedProduct || rowError.quantity || rowError.purchasePrice,
    );
    const hasErrors = Boolean(nextErrors.receivedAt || nextErrors.supplierId || hasRowErrors);

    setErrors(nextErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();

    if (!canSubmit || !isValid) {
      return false;
    }

    return onSubmit({
      receivedAt,
      supplierId,
      items: rows.map((row) => ({
        productId: String(row.selectedProduct?._id ?? ""),
        quantity: Number(row.quantity),
        purchasePrice: Number(row.purchasePrice),
      })),
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      onAttemptClose={handleAttemptClose}
      onSubmit={handleSubmit}
      title="Registrar lote"
    >
      <>
        <TextField
          type="date"
          label="Fecha de ingreso"
          value={receivedAt}
          onChange={(event) => {
            setReceivedAt(event.target.value);
            setErrors((prev) => ({ ...prev, receivedAt: undefined }));
          }}
          error={Boolean(errors.receivedAt)}
          helperText={errors.receivedAt ?? ""}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth error={Boolean(errors.supplierId)}>
          <InputLabel id="supplier-label">Proveedor</InputLabel>
          <Select
            labelId="supplier-label"
            value={supplierId}
            label="Proveedor"
            onChange={(event) => {
              setSupplierId(String(event.target.value));
              setErrors((prev) => ({ ...prev, supplierId: undefined }));
            }}
          >
            {suppliers.map((supplier) => (
              <MenuItem key={supplier._id} value={supplier._id}>
                {`${supplier.name} · ${supplier.nit}`}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.supplierId ?? ""}</FormHelperText>
        </FormControl>

        {rows.map((row, index) => (
          <Box key={row.rowId} sx={{ display: "grid", gap: 1.5 }}>
            {rows.length > 1 && <Divider />}

            <Autocomplete
              options={productOptions}
              value={row.selectedProduct}
              onChange={(_, value) => handleChangeRow(index, "selectedProduct", value)}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              getOptionLabel={(option) => `${option.name} · ${option.bar_code}`}
              renderOption={(props, option) => {
                return (
                  <Box
                    component="li"
                    {...props}
                    key={`${option._id}-${option.bar_code}-lot-option`}
                  >
                    {`${option.name} · ${option.bar_code}`}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Producto ${index + 1}`}
                  placeholder="Busca producto"
                  error={Boolean(errors.rows[index]?.selectedProduct)}
                  helperText={errors.rows[index]?.selectedProduct ?? ""}
                />
              )}
            />

            <TextField
              type="number"
              label="Cantidad"
              value={row.quantity}
              onChange={(event) => handleChangeRow(index, "quantity", event.target.value)}
              inputProps={{ min: 1 }}
              error={Boolean(errors.rows[index]?.quantity)}
              helperText={errors.rows[index]?.quantity ?? ""}
            />

            <FormControl fullWidth error={Boolean(errors.rows[index]?.purchasePrice)}>
              <InputLabel htmlFor={`purchase-price-${index}`}>Precio compra unidad</InputLabel>
              <OutlinedInput
                id={`purchase-price-${index}`}
                value={row.purchasePrice}
                onChange={(event) => handleChangeRow(index, "purchasePrice", event.target.value)}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                label="Precio compra unidad"
                type="number"
                inputProps={{ min: 0 }}
              />
              <FormHelperText>{errors.rows[index]?.purchasePrice ?? ""}</FormHelperText>
            </FormControl>

            {row.selectedProduct && (
              <Box sx={{ color: "text.secondary", fontSize: 13 }}>
                {`Stock actual de ${row.selectedProduct.name}: ${row.selectedProduct.amount}`}
              </Box>
            )}

            {rows.length > 1 && (
              <Button color="error" variant="text" onClick={() => handleRemoveProductRow(index)}>
                Quitar producto
              </Button>
            )}
          </Box>
        ))}

        <Button variant="outlined" onClick={handleAddProductRow}>
          Agregar producto
        </Button>
      </>
    </Modal>
  );
};
