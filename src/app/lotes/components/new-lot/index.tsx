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
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Modal } from "@/components/Modal";
import { SupplierRow } from "@/services/suppliers.service";
import { NewLotValues, ProductOption } from "../../hooks/useLots";

const MySwal = withReactContent(Swal);

const getProductOptionLabel = (option: ProductOption) => {
  const category = String(option.category_name ?? "").trim();
  const brand = String(option.brand_name ?? "").trim();
  const name = String(option.name ?? "").trim();

  return [category, brand, name].filter(Boolean).join(" ");
};

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
  const initialRow = useMemo(() => createRow(), []);

  const [receivedAt, setReceivedAt] = useState(initialDate);
  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState<RowState[]>([initialRow]);
  const [activeRowId, setActiveRowId] = useState(initialRow.rowId);
  const [errors, setErrors] = useState<{
    receivedAt?: string;
    supplierId?: string;
    rows: RowErrorState[];
  }>({ rows: [{}] });

  const activeRowIndex = useMemo(() => {
    const foundIndex = rows.findIndex((row) => row.rowId === activeRowId);

    return foundIndex === -1 ? 0 : foundIndex;
  }, [activeRowId, rows]);

  const activeRow = rows[activeRowIndex] ?? null;

  const selectableProductOptions = useMemo(() => {
    const selectedIdsInOtherRows = new Set(
      rows
        .filter((_, index) => index !== activeRowIndex)
        .map((row) => String(row.selectedProduct?._id ?? ""))
        .filter(Boolean),
    );

    return productOptions.filter((option) => !selectedIdsInOtherRows.has(String(option._id)));
  }, [activeRowIndex, productOptions, rows]);

  const hasRowContent = (row: RowState) =>
    Boolean(row.selectedProduct?._id) ||
    String(row.quantity ?? "").trim().length > 0 ||
    String(row.purchasePrice ?? "").trim().length > 0;

  const rowsToSubmit = useMemo(
    () =>
      rows.filter(
        (row) =>
          Boolean(row.selectedProduct?._id) ||
          String(row.quantity ?? "").trim().length > 0 ||
          String(row.purchasePrice ?? "").trim().length > 0,
      ),
    [rows],
  );

  const resetForm = () => {
    const nextInitialRow = createRow();
    setReceivedAt(initialDate);
    setSupplierId("");
    setRows([nextInitialRow]);
    setActiveRowId(nextInitialRow.rowId);
    setErrors({ rows: [{}] });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSubmit = useMemo(() => {
    if (!receivedAt || !supplierId || rowsToSubmit.length === 0) {
      return false;
    }

    return rowsToSubmit.every(
      (row) =>
        Boolean(row.selectedProduct?._id) &&
        Number(row.quantity) > 0 &&
        Number(row.purchasePrice) >= 0,
    );
  }, [receivedAt, rowsToSubmit, supplierId]);

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
      didOpen: (popup) => {
        popup.parentElement?.style.setProperty("z-index", "1600");
      },
    });

    return result.isConfirmed;
  };

  const handleAddProductRow = () => {
    const nextRow = createRow();
    setRows((prev) => [...prev, nextRow]);
    setErrors((prev) => ({
      ...prev,
      rows: [...prev.rows, {}],
    }));
    setActiveRowId(nextRow.rowId);
  };

  const handleRemoveProductRow = (indexToRemove: number) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      const nextRows = prev.filter((_, index) => index !== indexToRemove);
      const removedRowId = prev[indexToRemove]?.rowId;

      if (removedRowId === activeRowId) {
        const fallbackRow = nextRows[Math.max(0, indexToRemove - 1)] ?? nextRows[0];
        if (fallbackRow) {
          setActiveRowId(fallbackRow.rowId);
        }
      }

      return nextRows;
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
    if (key === "selectedProduct" && value && typeof value === "object") {
      const selectedProductId = String(value._id ?? "");
      const isDuplicated = rows.some(
        (row, index) =>
          index !== indexToUpdate && String(row.selectedProduct?._id ?? "") === selectedProductId,
      );

      if (isDuplicated) {
        setErrors((prev) => ({
          ...prev,
          rows: prev.rows.map((rowError, index) => {
            if (index !== indexToUpdate) {
              return rowError;
            }

            return {
              ...rowError,
              selectedProduct: "Este producto ya fue agregado al lote.",
            };
          }),
        }));

        return;
      }
    }

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

        if (!hasRowContent(row)) {
          return rowErrors;
        }

        if (!row.selectedProduct?._id) {
          rowErrors.selectedProduct = "El producto es requerido.";
        }

        const selectedProductId = String(row.selectedProduct?._id ?? "");
        if (selectedProductId) {
          const duplicatedCount = rows.reduce((count, candidateRow) => {
            return String(candidateRow.selectedProduct?._id ?? "") === selectedProductId
              ? count + 1
              : count;
          }, 0);

          if (duplicatedCount > 1) {
            rowErrors.selectedProduct = "Este producto ya fue agregado al lote.";
          }
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

    if (rowsToSubmit.length === 0) {
      const firstRowError = nextErrors.rows[0] ?? {};
      nextErrors.rows[0] = {
        ...firstRowError,
        selectedProduct: firstRowError.selectedProduct ?? "Agrega al menos un producto.",
      };
    }

    const hasRowErrors = nextErrors.rows.some(
      (rowError) => rowError.selectedProduct || rowError.quantity || rowError.purchasePrice,
    );
    const hasErrors = Boolean(
      nextErrors.receivedAt || nextErrors.supplierId || hasRowErrors || rowsToSubmit.length === 0,
    );

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
      items: rowsToSubmit.map((row) => ({
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
      fullWidth
      maxWidth="lg"
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr", lg: "0.85fr 1.15fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <TextField
            type="date"
            label="Fecha de ingreso"
            fullWidth
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
              {[...suppliers]
                .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"))
                .map((supplier) => (
                  <MenuItem key={supplier._id} value={supplier._id}>
                    {`${supplier.name} · ${supplier.nit}`}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>{errors.supplierId ?? ""}</FormHelperText>
          </FormControl>

          <Divider />

          {activeRow && (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {`Editar producto ${activeRowIndex + 1}`}
              </Typography>

              <Autocomplete
                options={selectableProductOptions}
                value={activeRow.selectedProduct}
                onChange={(_, value) => handleChangeRow(activeRowIndex, "selectedProduct", value)}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                getOptionLabel={getProductOptionLabel}
                renderOption={(props, option) => {
                  return (
                    <Box
                      component="li"
                      {...props}
                      key={`${option._id}-${option.bar_code}-lot-option`}
                    >
                      {getProductOptionLabel(option)}
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Producto"
                    placeholder="Busca producto"
                    error={Boolean(errors.rows[activeRowIndex]?.selectedProduct)}
                    helperText={errors.rows[activeRowIndex]?.selectedProduct ?? ""}
                  />
                )}
              />

              <TextField
                type="number"
                label="Cantidad"
                fullWidth
                value={activeRow.quantity}
                onChange={(event) =>
                  handleChangeRow(activeRowIndex, "quantity", event.target.value)
                }
                inputProps={{ min: 1 }}
                error={Boolean(errors.rows[activeRowIndex]?.quantity)}
                helperText={errors.rows[activeRowIndex]?.quantity ?? ""}
              />

              <FormControl fullWidth error={Boolean(errors.rows[activeRowIndex]?.purchasePrice)}>
                <InputLabel htmlFor={`purchase-price-${activeRowIndex}`}>
                  Precio compra unidad
                </InputLabel>
                <OutlinedInput
                  id={`purchase-price-${activeRowIndex}`}
                  value={activeRow.purchasePrice}
                  onChange={(event) =>
                    handleChangeRow(activeRowIndex, "purchasePrice", event.target.value)
                  }
                  startAdornment={<InputAdornment position="start">$</InputAdornment>}
                  label="Precio compra unidad"
                  type="number"
                  inputProps={{ min: 0 }}
                />
                <FormHelperText>{errors.rows[activeRowIndex]?.purchasePrice ?? ""}</FormHelperText>
              </FormControl>

              {activeRow.selectedProduct && (
                <Box sx={{ color: "text.secondary", fontSize: 13 }}>
                  {`Stock actual de ${activeRow.selectedProduct.name}: ${activeRow.selectedProduct.amount}`}
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="outlined" onClick={handleAddProductRow}>
                  Agregar producto
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {`Productos del lote (${rows.length})`}
          </Typography>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 110px 100px",
                gap: 1,
                px: 1.5,
                py: 1,
                bgcolor: "action.hover",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Producto
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, textAlign: "right" }}>
                Cant.
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, textAlign: "right" }}>
                Costo
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, textAlign: "right" }}>
                Acción
              </Typography>
            </Box>

            <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
              {rows.map((row, index) => {
                const isSelected = row.rowId === activeRowId;
                const hasError = Boolean(
                  errors.rows[index]?.selectedProduct ||
                  errors.rows[index]?.quantity ||
                  errors.rows[index]?.purchasePrice,
                );

                return (
                  <Box
                    key={row.rowId}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px 110px 100px",
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      bgcolor: isSelected ? "action.selected" : "background.paper",
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveRowId(row.rowId)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isSelected ? 700 : 500,
                        color: hasError ? "error.main" : "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.selectedProduct
                        ? getProductOptionLabel(row.selectedProduct)
                        : "Sin producto"}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right" }}>
                      {row.quantity || "-"}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right" }}>
                      {row.purchasePrice
                        ? `$${Number(row.purchasePrice).toLocaleString("es-CO")}`
                        : "-"}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        sx={{ fontWeight: 700, minWidth: 78 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveProductRow(index);
                        }}
                        disabled={rows.length === 1}
                      >
                        Quitar
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
