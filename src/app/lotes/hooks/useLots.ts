"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { ApiService } from "@/services/api.service";
import { createLot, getAllLots, LotRow } from "@/services/lots.service";
import { getAllSuppliers, SupplierRow } from "@/services/suppliers.service";

const MySwal = withReactContent(Swal);

export type ProductOption = {
  _id: string;
  name: string;
  bar_code: string;
  amount: number;
};

export type NewLotValues = {
  receivedAt: string;
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    purchasePrice: number;
  }>;
};

export const useLots = () => {
  const apiService = useMemo(() => new ApiService(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [lots, setLots] = useState<LotRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const [lotsResult, suppliersResult, productsResponse] = await Promise.all([
      getAllLots(),
      getAllSuppliers(),
      apiService.getAllProducts(),
    ]);

    if (lotsResult.success && lotsResult.data) {
      setLots(lotsResult.data);
    }

    if (suppliersResult.success && suppliersResult.data) {
      setSuppliers(suppliersResult.data);
    }

    if (productsResponse.ok) {
      const productsData = (await productsResponse.json()) as ProductOption[];
      setProductOptions(productsData);
    }

    setIsLoading(false);
  }, [apiService]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateLot = useCallback(
    async (values: NewLotValues) => {
      const result = await createLot(values);

      if (!result.success) {
        await MySwal.fire({
          icon: "error",
          title: "Error al crear lote",
          text: result.message ?? result.error ?? "No fue posible registrar el lote.",
        });
        return false;
      }

      void loadData().catch((error) => {
        console.error("Error recargando lotes tras crear", error);
      });

      globalThis.setTimeout(() => {
        void MySwal.fire({
          icon: "success",
          title: "Lote creado",
          text: "El stock fue actualizado correctamente.",
          timer: 1400,
          showConfirmButton: false,
        });
      }, 120);

      return true;
    },
    [loadData],
  );

  return {
    isLoading,
    createModalOpen,
    lots,
    suppliers,
    productOptions,
    setCreateModalOpen,
    handleCreateLot,
  };
};
