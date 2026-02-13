/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { FC } from "react";
import { Modal } from "../../../../components/Modal/index";
import NumberField from "@/components/NumberField";
import { ApiService } from "../../../../services/api.service";

export const NewProductAmount: FC<{
  product: any;
  onClose: () => void;
  onSubmit: () => void;
  open: boolean;
}> = ({ product, open, onClose, onSubmit }) => {
  const [amount, setAmount] = React.useState<number | null>(product?.amount ?? null);

  const apiService = new ApiService();

  const onSubmitModal = async () => {
    await apiService.updateProductsAmount(product._id, amount as number);
    onSubmit();
  };

  return (
    <Modal open={open} onClose={onClose} onSubmit={onSubmitModal} title="Añadir cantidad">
      <NumberField
        label="Ingrese la cantidad"
        size="medium"
        value={amount}
        onValueChange={(value) => setAmount(value)}
      />
    </Modal>
  );
};

export default NewProductAmount;
