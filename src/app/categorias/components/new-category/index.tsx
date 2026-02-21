import React, { FC, useState } from "react";
import { TextField } from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Modal } from "@/components/Modal";

const MySwal = withReactContent(Swal);

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

  const handleAttemptClose = async () => {
    const isFormDirty = String(values.name ?? "").trim().length > 0;

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
    <Modal
      open={open}
      onClose={handleClose}
      onAttemptClose={handleAttemptClose}
      onSubmit={onSubmitModal}
      title="Nueva categoría"
    >
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
