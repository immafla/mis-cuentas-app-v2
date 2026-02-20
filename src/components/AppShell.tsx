"use client";

import { useCallback, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MiniDrawer } from "./Drawer";

type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const navigate = useCallback((path: string) => () => router.push(path), [router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <MiniDrawer
      showDashboard={navigate("/")}
      showProduct={navigate("/inventario")}
      showLots={navigate("/lotes")}
      showSale={navigate("/ventas")}
      showSalesHistory={navigate("/historial-ventas")}
      showAddBrand={navigate("/marcas")}
      showCategories={navigate("/categorias")}
      showSuppliers={navigate("/proveedores")}
    >
      {children}
    </MiniDrawer>
  );
};

export default AppShell;
