import * as React from "react";
import { usePathname } from "next/navigation";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NoteAltSharpIcon from "@mui/icons-material/NoteAltSharp";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut, useSession } from "next-auth/react";
import { useColorMode } from "../ThemeRegistry";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

type MiniDrawerProps = {
  showDashboard: () => void;
  showProduct: () => void;
  showLots: () => void;
  showSale: () => void;
  showSalesHistory: () => void;
  showAddBrand: () => void;
  showSuppliers: () => void;
  children?: React.ReactNode;
};

type DrawerItem = {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  path: string;
};

export const MiniDrawer = ({
  showDashboard,
  showProduct,
  showLots,
  showSale,
  showSalesHistory,
  showAddBrand,
  showSuppliers,
  children,
}: MiniDrawerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const { data: session } = useSession();
  const { mode, toggleColorMode } = useColorMode();
  const [open, setOpen] = React.useState(true);
  const isRtl = theme.direction === "rtl";
  const userDisplayName = session?.user?.name ?? session?.user?.email ?? "Usuario";

  const mainItems = React.useMemo<DrawerItem[]>(
    () => [
      {
        label: "Resumen",
        icon: <HomeFilledIcon />,
        action: showDashboard,
        path: "/",
      },
      {
        label: "Vender",
        icon: <PointOfSaleIcon />,
        action: showSale,
        path: "/ventas",
      },
      {
        label: "Historial",
        icon: <ReceiptLongIcon />,
        action: showSalesHistory,
        path: "/historial-ventas",
      },
    ],
    [showDashboard, showSale, showSalesHistory],
  );

  const secondaryItems = React.useMemo<DrawerItem[]>(
    () => [
      {
        label: "Inventario",
        icon: <NoteAltSharpIcon />,
        action: showProduct,
        path: "/inventario",
      },
      {
        label: "Lotes",
        icon: <Inventory2Icon />,
        action: showLots,
        path: "/lotes",
      },
      {
        label: "Marcas",
        icon: <AssignmentIcon />,
        action: showAddBrand,
        path: "/marcas",
      },
      {
        label: "Proveedores",
        icon: <LocalShippingIcon />,
        action: showSuppliers,
        path: "/proveedores",
      },
    ],
    [showAddBrand, showLots, showProduct, showSuppliers],
  );

  const listItemButtonSx = React.useMemo(
    () => ({
      minHeight: 48,
      justifyContent: open ? "initial" : "center",
      px: 2.5,
      borderRadius: 1,
      mx: 1,
      "&.Mui-selected": {
        bgcolor: "action.selected",
      },
      "&.Mui-selected:hover": {
        bgcolor: "action.selected",
      },
    }),
    [open],
  );

  const listItemIconSx = React.useMemo(
    () => ({
      minWidth: 0,
      mr: open ? 3 : "auto",
      justifyContent: "center",
    }),
    [open],
  );

  const isActive = React.useCallback(
    (path: string) => (path === "/" ? pathname === "/" : pathname?.startsWith(path)),
    [pathname],
  );

  const renderItems = React.useCallback(
    (items: DrawerItem[]) =>
      items.map((item) => (
        <ListItem key={item.label} disablePadding sx={{ display: "block" }} onClick={item.action}>
          <ListItemButton sx={listItemButtonSx} selected={Boolean(isActive(item.path))}>
            <ListItemIcon sx={listItemIconSx}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      )),
    [isActive, listItemButtonSx, listItemIconSx, open],
  );

  const handleDrawerOpen = React.useCallback(() => {
    setOpen(true);
  }, []);

  const handleDrawerClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Box sx={{ display: "flex", padding: 0, margin: 0 }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            bgcolor: mode === "dark" ? "grey.950" : "background.paper",
            color: "text.primary",
            borderRightColor: "divider",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          },
        }}
      >
        <DrawerHeader
          sx={{
            flexDirection: open ? "row" : "column",
            justifyContent: open ? "space-between" : "center",
            gap: open ? 0 : 0.5,
            px: open ? 2 : 1,
          }}
        >
          {!isMobile && !open && (
            <IconButton onClick={handleDrawerOpen}>
              {isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          )}
          {open ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="Cambiar modo de tema"
                onClick={toggleColorMode}
              >
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Typography variant="caption" noWrap>
                  Y a beber
                </Typography>
                <Typography variant="subtitle2" noWrap>
                  {userDisplayName}
                </Typography>
              </Box>
            </Box>
          ) : (
            <IconButton color="inherit" aria-label="Cambiar modo de tema" onClick={toggleColorMode}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          )}

          {!isMobile && open && (
            <IconButton onClick={handleDrawerClose}>
              {isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
        </DrawerHeader>

        <Divider sx={{ borderColor: "divider" }} />
        <List>{renderItems(mainItems)}</List>
        <Divider sx={{ borderColor: "divider" }} />
        <List>{renderItems(secondaryItems)}</List>

        <Box sx={{ mt: "auto", pb: 1 }}>
          <Divider sx={{ borderColor: "divider" }} />
          <List>
            <ListItem
              disablePadding
              sx={{ display: "block" }}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <ListItemButton sx={listItemButtonSx}>
                <ListItemIcon sx={listItemIconSx}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar sesión" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
