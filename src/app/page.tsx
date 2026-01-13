"use client";

import { useState } from "react";
import { MiniDrawer } from "../components/molecules";
import {
  NewBrand,
  // NewInventary, //Para añadir inventario en el mass futuro
  NewSale,
  NewProduct,
} from "../components/pages";

export default function Home() {
  const [openNewBrandModal, setOpenNewBrandModal] = useState(false);
  const [openNewSaleModal, setOpenNewSaleModal] = useState(false);
  const [openNewProductModal, setOpenNewProductModal] = useState(false);

  return (
    <>
      {openNewSaleModal && (
        <NewSale
          open={openNewSaleModal}
          setOpen={() => setOpenNewSaleModal((prev) => !prev)}
        />
      )}

      {openNewProductModal && (
        <NewProduct
          open={openNewProductModal}
          setOpen={() => setOpenNewProductModal((prev) => !prev)}
        />
      )}

      {openNewBrandModal && (
        <NewBrand
          open={openNewBrandModal}
          setOpen={() => setOpenNewBrandModal((prev) => !prev)}
        />
      )}

      <MiniDrawer
        showProduct={() => setOpenNewProductModal((prev) => !prev)}
        showSale={() => setOpenNewSaleModal((prev) => !prev)}
        showAddBrand={() => setOpenNewBrandModal((prev) => !prev)}
      />
    </>
  );
}
