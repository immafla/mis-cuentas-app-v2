import React, { FC, useState } from "react";
import { TextField } from "@mui/material";

import { Modal } from "@/components/Modal";

export const NewSupplierModal: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; nit: string }) => Promise<boolean>;
}> = ({ open, onClose, onSubmit }) => {
  const [values, setValues] = useState({ name: "", nit: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setValues({ name: "", nit: "" });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSubmitModal = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    if (!values.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    if (!values.nit.trim()) {
      newErrors.nit = "El NIT es obligatorio";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return false;
    }

    const success = await onSubmit(values);
    if (success) {
      resetForm();
    }
    return success;
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose} onSubmit={onSubmitModal} title="Nuevo proveedor">
      <>
        <TextField
          label="Nombre del proveedor"
          name="name"
          variant="outlined"
          value={values.name}
          error={!!errors.name}
          helperText={errors.name}
          onChange={handleChange("name")}
        />
        <TextField
          label="NIT"
          name="nit"
          variant="outlined"
          value={values.nit}
          error={!!errors.nit}
          helperText={errors.nit}
          onChange={handleChange("nit")}
        />
      </>
    </Modal>
  );
};
