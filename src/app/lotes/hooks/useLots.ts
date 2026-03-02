"use client";

import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { MRT_Row } from "material-react-table";

import { createLot, deleteLotById, getAllLots, LotRow } from "@/services/lots.service";
import { getAllProducts } from "@/services/products.service";
import { getAllSuppliers, SupplierRow } from "@/services/suppliers.service";

const MySwal = withReactContent(Swal);

export type ProductOption = {
  _id: string;
  name: string;
  bar_code: string;
  amount: number;
  content?: string | number;
  brand_name?: string;
  category_name?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [lots, setLots] = useState<LotRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const [lotsResult, suppliersResult, productsResult] = await Promise.all([
      getAllLots(),
      getAllSuppliers(),
      getAllProducts(),
    ]);

    if (lotsResult.success && lotsResult.data) {
      setLots(
        [...lotsResult.data].sort((a, b) =>
          String(a.supplierName ?? "").localeCompare(String(b.supplierName ?? ""), "es"),
        ),
      );
    }

    if (suppliersResult.success && suppliersResult.data) {
      setSuppliers(
        [...suppliersResult.data].sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"),
        ),
      );
    }

    if (productsResult.success && productsResult.data) {
      const productsData = productsResult.data as ProductOption[];
      setProductOptions(
        [...productsData].sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"),
        ),
      );
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
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

  const handleDeleteLot = useCallback(
    async (row: MRT_Row<LotRow>) => {
      if (row.original.isActive) {
        await MySwal.fire({
          icon: "warning",
          title: "No se puede eliminar",
          text: "Este lote aún tiene productos restantes. Solo puedes eliminar lotes inactivos.",
        });
        return;
      }

      const confirmDelete = await MySwal.fire({
        icon: "warning",
        title: "¿Eliminar lote?",
        text: "Se eliminará el registro del lote.",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      });

      if (!confirmDelete.isConfirmed) {
        return;
      }

      const result = await deleteLotById(row.original._id);

      if (!result.success) {
        await MySwal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: result.message ?? result.error ?? "No fue posible eliminar el lote.",
        });
        return;
      }

      setLots((prev) => prev.filter((lot) => lot._id !== row.original._id));

      void loadData().catch((error) => {
        console.error("Error recargando lotes tras eliminar", error);
      });

      await MySwal.fire({
        icon: "success",
        title: "Lote eliminado",
        timer: 1300,
        showConfirmButton: false,
      });
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
    handleDeleteLot,
  };
};
