import React, { FC, useEffect, useMemo, useState } from "react";
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
import { LotRow } from "@/services/lots.service";
import { NewLotValues, ProductOption } from "../../hooks/useLots";

const MySwal = withReactContent(Swal);

const getProductOptionLabel = (option: ProductOption) => {
  const category = String(option.category_name ?? "").trim();
  const brand = String(option.brand_name ?? "").trim();
  const name = String(option.name ?? "").trim();

  return [category, brand, name].filter(Boolean).join(" ");
};

export const EditLotModal: FC<{
  open: boolean;
  lot: LotRow | null;
  onClose: () => void;
  suppliers: SupplierRow[];
  productOptions: ProductOption[];
  onSubmit: (lotId: string, values: NewLotValues) => Promise<boolean>;
}> = ({ open, lot, onClose, suppliers, productOptions, onSubmit }) => {
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

  const buildSnapshot = (
    snapshotReceivedAt: string,
    snapshotSupplierId: string,
    snapshotRows: RowState[],
  ) =>
    JSON.stringify({
      receivedAt: snapshotReceivedAt,
      supplierId: snapshotSupplierId,
      rows: snapshotRows.map((row) => ({
        productId: String(row.selectedProduct?._id ?? ""),
        quantity: String(row.quantity ?? "").trim(),
        purchasePrice: String(row.purchasePrice ?? "").trim(),
      })),
    });

  const [receivedAt, setReceivedAt] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState<RowState[]>([createRow()]);
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [errors, setErrors] = useState<{
    receivedAt?: string;
    supplierId?: string;
    rows: RowErrorState[];
  }>({ rows: [{}] });

  // Populate form when lot changes
  useEffect(() => {
    if (!lot || !open) return;

    const nextReceivedAt = lot.receivedAt
      ? new Date(lot.receivedAt).toISOString().slice(0, 10)
      : "";
    setReceivedAt(nextReceivedAt);

    const matchedSupplier = suppliers.find((s) => s.name === lot.supplierName);
    const nextSupplierId = matchedSupplier?._id ?? "";
    setSupplierId(nextSupplierId);

    if (lot.productsDetails?.length) {
      const populatedRows: RowState[] = lot.productsDetails.map((detail) => {
        const matchedProduct = productOptions.find((p) => p.name === detail.name) ?? null;
        return {
          rowId: crypto.randomUUID(),
          selectedProduct: matchedProduct,
          quantity: String(detail.quantity),
          purchasePrice: String(detail.purchasePrice),
        };
      });
      setRows(populatedRows);
      setErrors({ rows: populatedRows.map(() => ({})) });
      setInitialSnapshot(buildSnapshot(nextReceivedAt, nextSupplierId, populatedRows));
    } else {
      const emptyRows = [createRow()];
      setRows(emptyRows);
      setErrors({ rows: [{}] });
      setInitialSnapshot(buildSnapshot(nextReceivedAt, nextSupplierId, emptyRows));
    }
  }, [lot, open, suppliers, productOptions]);

  const resetForm = () => {
    setReceivedAt("");
    setSupplierId("");
    setRows([createRow()]);
    setInitialSnapshot("");
    setErrors({ rows: [{}] });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSubmit = useMemo(() => {
    if (!receivedAt || !supplierId || rows.length === 0) return false;
    return rows.every(
      (row) =>
        Boolean(row.selectedProduct?._id) &&
        Number(row.quantity) > 0 &&
        Number(row.purchasePrice) >= 0,
    );
  }, [receivedAt, rows, supplierId]);

  const isFormDirty = useMemo(() => {
    if (!open || !lot || !initialSnapshot) {
      return false;
    }

    return buildSnapshot(receivedAt, supplierId, rows) !== initialSnapshot;
  }, [initialSnapshot, lot, open, receivedAt, rows, supplierId]);

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

  const handleAddProductRow = () => {
    setRows((prev) => [...prev, createRow()]);
    setErrors((prev) => ({ ...prev, rows: [...prev.rows, {}] }));
  };

  const handleRemoveProductRow = (indexToRemove: number) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== indexToRemove)));
    setErrors((prev) =>
      prev.rows.length <= 1
        ? prev
        : { ...prev, rows: prev.rows.filter((_, i) => i !== indexToRemove) },
    );
  };

  const handleChangeRow = (
    indexToUpdate: number,
    key: "selectedProduct" | "quantity" | "purchasePrice",
    value: ProductOption | string | null,
  ) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i === indexToUpdate) {
          return { ...row, [key]: value };
        }

        return row;
      }),
    );
    setErrors((prev) => ({
      ...prev,
      rows: prev.rows.map((rowError, i) => {
        if (i === indexToUpdate) {
          return { ...rowError, [key]: undefined };
        }

        return rowError;
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
        if (!row.selectedProduct?._id) rowErrors.selectedProduct = "El producto es requerido.";
        if (!String(row.quantity).trim()) rowErrors.quantity = "La cantidad es requerida.";
        else if (!Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0)
          rowErrors.quantity = "La cantidad debe ser mayor a 0.";
        if (!String(row.purchasePrice).trim())
          rowErrors.purchasePrice = "El precio de compra es requerido.";
        else if (!Number.isFinite(Number(row.purchasePrice)) || Number(row.purchasePrice) < 0)
          rowErrors.purchasePrice = "El precio de compra no puede ser negativo.";
        return rowErrors;
      }),
    };

    if (!String(receivedAt).trim()) nextErrors.receivedAt = "La fecha de ingreso es requerida.";
    if (!String(supplierId).trim()) nextErrors.supplierId = "El proveedor es requerido.";

    const hasRowErrors = nextErrors.rows.some(
      (re) => re.selectedProduct || re.quantity || re.purchasePrice,
    );
    const hasErrors = Boolean(nextErrors.receivedAt || nextErrors.supplierId || hasRowErrors);

    setErrors(nextErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!canSubmit || !isValid || !lot) return false;

    return onSubmit(lot._id, {
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
      title="Editar lote"
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
          <InputLabel id="edit-supplier-label">Proveedor</InputLabel>
          <Select
            labelId="edit-supplier-label"
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
              getOptionLabel={getProductOptionLabel}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={`${option._id}-${option.bar_code}-edit-lot-option`}
                >
                  {getProductOptionLabel(option)}
                </Box>
              )}
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
              <InputLabel htmlFor={`edit-purchase-price-${index}`}>Precio compra unidad</InputLabel>
              <OutlinedInput
                id={`edit-purchase-price-${index}`}
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
