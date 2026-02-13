import React, { FC, useState } from "react";
import { TextField } from "@mui/material";

import { Modal } from "@/components/Modal";

export const NewSupplierModal: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; nit: string }) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [values, setValues] = useState({
    name: "",
    nit: "",
  });

  const onSubmitModal = () => {
    onSubmit(values);
  };

  return (
    <Modal open={open} onClose={onClose} onSubmit={onSubmitModal} title="Nuevo proveedor">
      <>
        <TextField
          label="Nombre del proveedor"
          name="name"
          variant="outlined"
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
        />
        <TextField
          label="NIT"
          name="nit"
          variant="outlined"
          value={values.nit}
          onChange={(event) => setValues((prev) => ({ ...prev, nit: event.target.value }))}
        />
      </>
    </Modal>
  );
};
