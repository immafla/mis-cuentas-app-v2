import React, { FC, useState } from "react";
import { Modal } from "../../../../components/Modal";
import { MRT_ColumnDef } from "material-react-table";
import { TextField } from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const NewBrandModal: FC<{
  columns: MRT_ColumnDef<any>[];
  onClose: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  open: boolean;
}> = ({ columns, open, onClose, onSubmit }) => {
  const getInitialValues = () =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ""] = "";
      return acc;
    }, {} as any);

  const [values, setValues] = useState<any>(getInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetValues = () => {
    setValues(getInitialValues());
    setErrors({});
  };

  const handleClose = () => {
    resetValues();
    onClose();
  };

  const handleAttemptClose = async () => {
    const isFormDirty = Object.values(values).some((value) =>
      typeof value === "string" ? value.trim().length > 0 : Boolean(value),
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
      didOpen: (popup) => {
        popup.parentElement?.style.setProperty("z-index", "1600");
      },
    });

    return result.isConfirmed;
  };

  const onSubmitModal = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    columns.forEach((column) => {
      const key = column.accessorKey ?? "";
      if (!values[key]?.trim()) {
        newErrors[key] = `${column.header} es obligatorio`;
      }
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return false;
    }

    const success = await onSubmit(values);
    if (success) {
      resetValues();
    }
    return success;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      onAttemptClose={handleAttemptClose}
      onSubmit={onSubmitModal}
      title="Nueva marca"
    >
      <>
        {columns.map((column, index) => {
          const key = column.accessorKey ?? "";
          return (
            <TextField
              key={key || String(column.header ?? index)}
              label={column.header}
              name={key}
              value={values[key] ?? ""}
              variant="outlined"
              error={!!errors[key]}
              helperText={errors[key]}
              onChange={(e) => {
                setValues({ ...values, [e.target.name]: e.target.value });
                if (errors[key]) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                  });
                }
              }}
            />
          );
        })}
      </>
    </Modal>
  );
};
