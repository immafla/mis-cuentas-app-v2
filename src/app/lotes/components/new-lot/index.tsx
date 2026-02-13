import React, { FC, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";

import { Modal } from "@/components/Modal";
import { SupplierRow } from "@/services/suppliers.service";
import { NewLotValues, ProductOption } from "../../hooks/useLots";

export const NewLotModal: FC<{
  open: boolean;
  onClose: () => void;
  suppliers: SupplierRow[];
  productOptions: ProductOption[];
  onSubmit: (values: NewLotValues) => Promise<boolean>;
}> = ({ open, onClose, suppliers, productOptions, onSubmit }) => {
  const createRow = () => ({
    rowId: crypto.randomUUID(),
    selectedProduct: null as ProductOption | null,
    quantity: "",
    purchasePrice: "",
  });

  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState<
    Array<{
      rowId: string;
      selectedProduct: ProductOption | null;
      quantity: string;
      purchasePrice: string;
    }>
  >([createRow()]);

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

  const handleAddProductRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const handleRemoveProductRow = (indexToRemove: number) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((_, index) => index !== indexToRemove);
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
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
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
    <Modal open={open} onClose={onClose} onSubmit={handleSubmit} title="Registrar lote">
      <>
        <TextField
          type="date"
          label="Fecha de ingreso"
          value={receivedAt}
          onChange={(event) => setReceivedAt(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth>
          <InputLabel id="supplier-label">Proveedor</InputLabel>
          <Select
            labelId="supplier-label"
            value={supplierId}
            label="Proveedor"
            onChange={(event) => setSupplierId(String(event.target.value))}
          >
            {suppliers.map((supplier) => (
              <MenuItem key={supplier._id} value={supplier._id}>
                {`${supplier.name} · ${supplier.nit}`}
              </MenuItem>
            ))}
          </Select>
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
                const { key, ...rest } = props;
                return (
                  <Box component="li" {...rest} key={`${option._id}-${option.bar_code}-lot-option`}>
                    {`${option.name} · ${option.bar_code}`}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Producto ${index + 1}`}
                  placeholder="Busca producto"
                />
              )}
            />

            <TextField
              type="number"
              label="Cantidad"
              value={row.quantity}
              onChange={(event) => handleChangeRow(index, "quantity", event.target.value)}
              inputProps={{ min: 1 }}
            />

            <FormControl fullWidth>
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
