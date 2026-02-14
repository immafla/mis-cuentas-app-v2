"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type GlobalContextValue = {
  isLoadingTable: boolean;
  setTableSourceLoading: (sourceId: string, isLoading: boolean) => void;
  runWithTableLoading: <T>(action: () => Promise<T> | T) => Promise<T>;
};

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

export const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [tableSources, setTableSources] = useState<Record<string, boolean>>({});
  const [tableActionCounter, setTableActionCounter] = useState(0);

  const setTableSourceLoading = useCallback((sourceId: string, isLoading: boolean) => {
    setTableSources((prev) => {
      const current = Boolean(prev[sourceId]);

      if (current === isLoading) {
        return prev;
      }

      if (!isLoading) {
        const next = { ...prev };
        delete next[sourceId];
        return next;
      }

      return {
        ...prev,
        [sourceId]: true,
      };
    });
  }, []);

  const runWithTableLoading = useCallback(async <T,>(action: () => Promise<T> | T) => {
    setTableActionCounter((prev) => prev + 1);

    try {
      return await Promise.resolve(action());
    } finally {
      setTableActionCounter((prev) => Math.max(prev - 1, 0));
    }
  }, []);

  const isLoadingTable = tableActionCounter > 0 || Object.values(tableSources).some(Boolean);

  const value = useMemo<GlobalContextValue>(
    () => ({
      isLoadingTable,
      setTableSourceLoading,
      runWithTableLoading,
    }),
    [isLoadingTable, runWithTableLoading, setTableSourceLoading],
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error("useGlobalContext debe usarse dentro de GlobalProvider");
  }

  return context;
};
