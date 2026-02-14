import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getProductByBarcode } from "../../../services/products.service";
import { createSaleRecord } from "@/services/sales.service";

type SaleLineItem = {
  id: string;
  barCode: string;
  name: string;
  price: number;
  purchasePrice: number;
  amount: number;
  quantity: number;
};

export type ProductSearchOption = {
  _id: string;
  name: string;
  sale_price: string;
  amount: number;
  bar_code: string;
};

const initialSaleProducts: SaleLineItem[] = [];

const normalizeBarcode = (value: string) => value.trim();

export const useSales = () => {
  const router = useRouter();
  const [listSelectedProducts, setListSelectedProducts] =
    useState<SaleLineItem[]>(initialSaleProducts);
  const [isPaying, setIsPaying] = useState(false);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearchOptions, setProductSearchOptions] = useState<ProductSearchOption[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  const addProductByBarcode = useCallback(async (barCode: string) => {
    const normalizedBarCode = normalizeBarcode(barCode);

    if (!normalizedBarCode) {
      return;
    }

    try {
      const { success, data } = await getProductByBarcode(normalizedBarCode);

      if (!success || !data) {
        throw new Error("Producto no encontrado");
      }

      const productId = String(data._id ?? "");
      const productBarCode = normalizeBarcode(String(data.bar_code ?? normalizedBarCode));

      setListSelectedProducts((prevState) => {
        if ((data.amount ?? 0) <= 0) {
          setStockWarning(`Sin stock disponible para ${data.name}`);
          return prevState;
        }

        const existingIndex = prevState.findIndex((item) => item.id === productId);

        if (existingIndex === -1) {
          return [
            ...prevState,
            {
              id: productId,
              barCode: productBarCode,
              name: data.name,
              price: Number(data.sale_price),
              purchasePrice: 0,
              amount: data.amount ?? 0,
              quantity: 1,
            },
          ];
        }

        return prevState.map((item, index) => {
          if (index !== existingIndex) {
            return item;
          }

          const isStockLimitReached = item.quantity >= (item.amount ?? 0);
          if (isStockLimitReached) {
            setStockWarning(`Llegaste al stock máximo de ${item.name}`);
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + 1,
          };
        });
      });
    } catch (error) {
      console.error("Error al obtener producto por código de barras", error);
    }
  }, []);

  const addProductToSale = useCallback((product: ProductSearchOption) => {
    const productId = String(product._id ?? "");
    const productBarCode = normalizeBarcode(String(product.bar_code ?? ""));

    setListSelectedProducts((prevState) => {
      if ((product.amount ?? 0) <= 0) {
        setStockWarning(`Sin stock disponible para ${product.name}`);
        return prevState;
      }

      const existingIndex = prevState.findIndex((item) => item.id === productId);

      if (existingIndex === -1) {
        return [
          ...prevState,
          {
            id: productId,
            barCode: productBarCode,
            name: product.name,
            price: Number(product.sale_price),
            purchasePrice: 0,
            amount: product.amount ?? 0,
            quantity: 1,
          },
        ];
      }

      return prevState.map((item, index) => {
        if (index !== existingIndex) {
          return item;
        }

        const isStockLimitReached = item.quantity >= (item.amount ?? 0);
        if (isStockLimitReached) {
          setStockWarning(`Llegaste al stock máximo de ${item.name}`);
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      });
    });
  }, []);

  const handleSelectSearchedProduct = useCallback(
    (product: ProductSearchOption | null) => {
      if (!product) {
        return;
      }

      addProductToSale(product);
      setProductSearchInput("");
      setProductSearchOptions([]);
    },
    [addProductToSale],
  );

  const total = useMemo(
    () =>
      listSelectedProducts.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0),
    [listSelectedProducts],
  );

  const totalItems = useMemo(
    () => listSelectedProducts.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    [listSelectedProducts],
  );

  const groupedSelectedProducts = useMemo<SaleLineItem[]>(
    () => listSelectedProducts,
    [listSelectedProducts],
  );

  const handleRemoveOneProduct = useCallback((id: string) => {
    setListSelectedProducts((prevState) => {
      const indexToUpdate = prevState.findIndex((item) => item.id === id);

      if (indexToUpdate === -1) {
        return prevState;
      }

      const item = prevState[indexToUpdate];

      if ((item.quantity ?? 1) <= 1) {
        return prevState.filter((product) => product.id !== id);
      }

      return prevState.map((product, index) =>
        index === indexToUpdate
          ? {
              ...product,
              quantity: product.quantity - 1,
            }
          : product,
      );
    });
  }, []);

  const handleIncreaseProductQuantity = useCallback((id: string) => {
    setListSelectedProducts((prevState) =>
      prevState.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const isStockLimitReached = item.quantity >= (item.amount ?? 0);
        if (isStockLimitReached) {
          setStockWarning(`Llegaste al stock máximo de ${item.name}`);
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    );
  }, []);

  const handleSetProductQuantity = useCallback((id: string, quantity: number) => {
    setListSelectedProducts((prevState) =>
      prevState.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const normalizedQuantity = Math.max(1, Math.floor(quantity || 1));
        const maxAllowed = Math.max(item.amount ?? 0, 1);

        if (normalizedQuantity > maxAllowed) {
          setStockWarning(`Llegaste al stock máximo de ${item.name}`);
        }

        return {
          ...item,
          quantity: Math.min(normalizedQuantity, maxAllowed),
        };
      }),
    );
  }, []);

  const clearStockWarning = useCallback(() => {
    setStockWarning(null);
  }, []);

  const clearSaleSuccessMessage = useCallback(() => {
    setSaleSuccessMessage(null);
  }, []);

  const handleRemoveAllProduct = useCallback((id: string) => {
    setListSelectedProducts((prevState) => prevState.filter((item) => item.id !== id));
  }, []);

  const handlePay = useCallback(async () => {
    if (totalItems === 0 || isPaying) {
      return;
    }

    setIsPaying(true);
    try {
      const soldItems = listSelectedProducts.map(
        ({ id, barCode, name, price, purchasePrice, quantity }) => ({
          id,
          barCode,
          name,
          price,
          purchasePrice,
          quantity,
        }),
      );

      const updates = Array.from(
        listSelectedProducts.reduce((accumulator, item) => {
          const previousQuantity = accumulator.get(item.id) ?? 0;
          accumulator.set(item.id, previousQuantity + Number(item.quantity ?? 0));
          return accumulator;
        }, new Map<string, number>()),
      ).map(([id, quantity]) => ({ id, quantity }));

      const response = await fetch("/api/products/amount", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el stock en la base de datos");
      }

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!result?.success) {
        throw new Error(result?.message ?? "Error actualizando stock");
      }

      const saleResult = await createSaleRecord(soldItems);

      if (!saleResult.success) {
        throw new Error(saleResult.message ?? "No se pudo registrar la venta");
      }

      setListSelectedProducts([]);
      setSaleSuccessMessage("Venta registrada correctamente");
      globalThis.setTimeout(() => {
        router.push("/");
      }, 350);
    } catch (error) {
      console.error("Error al actualizar el inventario", error);
      setStockWarning("No se pudo procesar la venta. Intenta de nuevo.");
    } finally {
      setIsPaying(false);
    }
  }, [isPaying, listSelectedProducts, router, totalItems]);

  useEffect(() => {
    const trimmedSearch = productSearchInput.trim();

    if (trimmedSearch.length < 2) {
      setProductSearchOptions([]);
      setIsSearchingProducts(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(async () => {
      try {
        setIsSearchingProducts(true);
        const response = await fetch(
          `/api/products?q=${encodeURIComponent(trimmedSearch)}&limit=10`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("No se pudo buscar productos");
        }

        const data = (await response.json()) as ProductSearchOption[];
        setProductSearchOptions(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error al buscar productos", error);
        setProductSearchOptions([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingProducts(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      globalThis.clearTimeout(timeoutId);
    };
  }, [productSearchInput]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTypingField) {
        return;
      }

      const currentTime = Date.now();

      const diff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (event.key === "Enter") {
        const scannedBarCode = bufferRef.current;
        bufferRef.current = "";

        const normalizedScannedBarCode = normalizeBarcode(scannedBarCode);

        if (normalizedScannedBarCode.length > 2) {
          addProductByBarcode(normalizedScannedBarCode);
        }
        return;
      }

      if (diff > 100) {
        bufferRef.current = "";
      }

      if (event.key.length === 1) {
        bufferRef.current += event.key;
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);

    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [addProductByBarcode]);

  return {
    listSelectedProducts,
    groupedSelectedProducts,
    total,
    totalItems,
    isPaying,
    productSearchInput,
    productSearchOptions,
    isSearchingProducts,
    stockWarning,
    saleSuccessMessage,
    setProductSearchInput,
    clearStockWarning,
    clearSaleSuccessMessage,
    handleSelectSearchedProduct,
    handleRemoveOneProduct,
    handleIncreaseProductQuantity,
    handleSetProductQuantity,
    handleRemoveAllProduct,
    handlePay,
  };
};
