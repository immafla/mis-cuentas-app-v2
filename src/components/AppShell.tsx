"use client";

import { useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MiniDrawer } from "./Drawer";

type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => {
  const router = useRouter();
  const navigate = useCallback(
    (path: string) => () => router.push(path),
    [router],
  );

  return (
    <MiniDrawer
      showDashboard={navigate("/")}
      showProduct={navigate("/inventario")}
      showSale={navigate("/ventas")}
      showAddBrand={navigate("/marcas")}
    >
      {children}
    </MiniDrawer>
  );
};

export default AppShell;
