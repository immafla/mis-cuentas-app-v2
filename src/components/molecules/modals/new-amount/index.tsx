/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { FC } from "react";
import { Modal } from "../../../Modal/index";
import { MRT_ColumnDef } from "material-react-table";
import NumberField from "@/components/NumberField";
import { ApiService } from '../../../../services/api.service'

export const NewProductAmount: FC<{
  idProduct: string;
  onClose: () => void;
  onSubmit: (values: any) => void;
  open: boolean;
}> = ({ idProduct, open, onClose, onSubmit }) => {
  const [amount, setAmount] = React.useState<number | null>();
  const onSubmitModal = () => {
    console.log(idProduct)
    const apiService = new ApiService();
    apiService.updateProductsAmount(idProduct, amount as number);
    // onSubmit({
    //   ...values,
    //   amount: 0,
    //   brand: brandSelected.value,
    //   category: categorySelected.value,
    // });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onSubmit={onSubmitModal}
      title="Añadir cantidad"
    >
      <NumberField
        label="Ingrese la cantidad"
        size="medium"
        onValueChange={(value) => setAmount(value)}
      />
    </Modal>
  );
};

export default NewProductAmount;
