import React, { FC, useState } from "react";
import { Modal } from "../../../../components/Modal";
import { MRT_ColumnDef } from "material-react-table";
import { TextField } from "@mui/material";

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
    <Modal open={open} onClose={handleClose} onSubmit={onSubmitModal} title="Nueva marca">
      <>
        {columns.map((column, index) => {
          const key = column.accessorKey ?? "";
          return (
            <TextField
              key={index}
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
