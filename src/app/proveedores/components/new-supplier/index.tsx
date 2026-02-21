import React, { FC, useState } from "react";
import { TextField } from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Modal } from "@/components/Modal";

const MySwal = withReactContent(Swal);

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

  const handleAttemptClose = async () => {
    const isFormDirty = Object.values(values).some(
      (value) => String(value ?? "").trim().length > 0,
    );

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
    <Modal
      open={open}
      onClose={handleClose}
      onAttemptClose={handleAttemptClose}
      onSubmit={onSubmitModal}
      title="Nuevo proveedor"
    >
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
