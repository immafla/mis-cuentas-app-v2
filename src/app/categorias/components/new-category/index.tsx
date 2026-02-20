import React, { FC, useState } from "react";
import { TextField } from "@mui/material";

import { Modal } from "@/components/Modal";

export const NewCategoryModal: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string }) => Promise<boolean>;
}> = ({ open, onClose, onSubmit }) => {
  const [values, setValues] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setValues({ name: "" });
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ name: event.target.value });
    if (errors.name) {
      setErrors({});
    }
  };

  return (
    <Modal open={open} onClose={handleClose} onSubmit={onSubmitModal} title="Nueva categoría">
      <TextField
        label="Nombre de la categoría"
        name="name"
        variant="outlined"
        value={values.name}
        error={!!errors.name}
        helperText={errors.name}
        onChange={handleChange}
        fullWidth
      />
    </Modal>
  );
};
