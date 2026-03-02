import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getAllProducts, getProductByBarcode } from "../../../services/products.service";
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
  brand_name?: string;
  category_name?: string;
};

const initialSaleProducts: SaleLineItem[] = [];

const normalizeBarcode = (value: string) => value.trim();

const sanitizeIdText = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "[object Object]" ? "" : trimmed;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const normalizeMongoId = (value: unknown): string => {
  console.log({ value });
  if (typeof value === "string") {
    return sanitizeIdText(value);
  }

  if (!isObject(value)) {
    return "";
  }

  const asObject = value as {
    $oid?: unknown;
    toHexString?: () => string;
    toString?: () => string;
    _id?: unknown;
  };

  if (typeof asObject.$oid === "string") {
    return sanitizeIdText(asObject.$oid);
  }

  if (typeof asObject.toHexString === "function") {
    return sanitizeIdText(asObject.toHexString());
  }

  const nestedId = normalizeMongoId(asObject._id);
  if (nestedId) {
    return nestedId;
  }

  if (typeof asObject.toString === "function") {
    return sanitizeIdText(asObject.toString());
  }

  return "";
};

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
  const payLockRef = useRef(false);

  const addProductByBarcode = useCallback(async (barCode: string) => {
    console.log({ barCode });
    const normalizedBarCode = normalizeBarcode(barCode);
    console.log({ normalizedBarCode });

    if (!normalizedBarCode) {
      return;
    }

    try {
      const { success, data } = await getProductByBarcode(normalizedBarCode);
      console.log({ success, data });
      if (!success || !data) {
        throw new Error("Producto no encontrado");
      }

      const productId = normalizeMongoId(data._id);
      const productBarCode = normalizeBarcode(String(data.bar_code ?? normalizedBarCode));

      if (!productId) {
        setStockWarning("No se pudo identificar el producto escaneado. Intenta de nuevo.");
        return;
      }

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
              name: String(data.name ?? ""),
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
    const productId = normalizeMongoId(product._id);
    const productBarCode = normalizeBarcode(String(product.bar_code ?? ""));

    if (!productId) {
      setStockWarning("No se pudo identificar el producto seleccionado. Intenta de nuevo.");
      return;
    }

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

  const handleSetProductPrice = useCallback((id: string, price: number) => {
    setListSelectedProducts((prevState) =>
      prevState.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const normalizedPrice = Number.isFinite(price) ? Math.max(price, 0) : 0;

        return {
          ...item,
          price: normalizedPrice,
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
    if (totalItems === 0 || isPaying || payLockRef.current) {
      return;
    }

    payLockRef.current = true;
    setIsPaying(true);
    try {
      const soldItems = listSelectedProducts
        .filter((item) => normalizeMongoId(item.id).length > 0)
        .map(({ id, barCode, name, price, purchasePrice, quantity }) => ({
          id,
          barCode,
          name,
          price,
          purchasePrice,
          quantity,
        }));

      if (!soldItems.length) {
        throw new Error("No hay productos válidos para procesar la venta");
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
      payLockRef.current = false;
      setIsPaying(false);
    }
  }, [isPaying, listSelectedProducts, router, totalItems]);

  useEffect(() => {
    const trimmedSearch = productSearchInput.trim();
    let isCancelled = false;

    if (trimmedSearch.length < 2) {
      setProductSearchOptions([]);
      setIsSearchingProducts(false);
      return;
    }

    const timeoutId = globalThis.setTimeout(async () => {
      try {
        setIsSearchingProducts(true);
        const response = await getAllProducts({ q: trimmedSearch, limit: 10 });

        if (!response.success || !response.data) {
          throw new Error("No se pudo buscar productos");
        }

        if (!isCancelled) {
          setProductSearchOptions(response.data as ProductSearchOption[]);
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }
        console.error("Error al buscar productos", error);
        setProductSearchOptions([]);
      } finally {
        if (!isCancelled) {
          setIsSearchingProducts(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
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
    handleSetProductPrice,
    handleRemoveAllProduct,
    handlePay,
  };
};
