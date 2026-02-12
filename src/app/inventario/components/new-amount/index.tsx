/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { FC } from "react";
import { Modal } from "../../../../components/Modal/index";
import NumberField from "@/components/NumberField";
import { ApiService } from "../../../../services/api.service";

export const NewProductAmount: FC<{
  idProduct: string;
  onClose: () => void;
  onSubmit: () => void;
  open: boolean;
}> = ({ idProduct, open, onClose, onSubmit }) => {
  const [amount, setAmount] = React.useState<number | null>();

  const apiService = new ApiService();

  const onSubmitModal = async () => {
    await apiService.updateProductsAmount(idProduct, amount as number);
    onSubmit();
  };

  return (
    <Modal open={open} onClose={onClose} onSubmit={onSubmitModal} title="Añadir cantidad">
      <NumberField
        label="Ingrese la cantidad"
        size="medium"
        onValueChange={(value) => setAmount(value)}
      />
    </Modal>
  );
};

export default NewProductAmount;
