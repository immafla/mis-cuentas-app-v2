import * as React from "react";
import { usePathname } from "next/navigation";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Paper from "@mui/material/Paper";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NoteAltSharpIcon from "@mui/icons-material/NoteAltSharp";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
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

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
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

  const mainItems = React.useMemo<DrawerItem[]>(
    () => [
      {
        label: "Inicio",
        icon: <HomeFilledIcon />,
        action: showDashboard,
        path: "/",
      },
      {
        label: "Ventas",
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
        label: "Nueva marca",
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

  const mobileItems = React.useMemo(
    () => [...mainItems, ...secondaryItems],
    [mainItems, secondaryItems],
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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={!isMobile && open}
        sx={{
          bgcolor: mode === "dark" ? "grey.900" : "primary.main",
          color: mode === "dark" ? "grey.100" : "common.white",
          boxShadow: mode === "dark" ? 6 : 3,
        }}
      >
        <Toolbar>
          {!isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            Y a beber!
          </Typography>
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit" aria-label="Cambiar modo de tema" onClick={toggleColorMode}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Typography variant="body2" noWrap>
              {session?.user?.name ?? session?.user?.email ?? "Usuario"}
            </Typography>
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              onClick={() => signOut({ callbackUrl: "/login" })}
              sx={{
                borderColor: mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)",
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            "& .MuiDrawer-paper": {
              bgcolor: mode === "dark" ? "grey.950" : "background.paper",
              color: "text.primary",
              borderRightColor: "divider",
            },
          }}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>

          <Divider sx={{ borderColor: "divider" }} />
          <List>{renderItems(mainItems)}</List>
          <Divider sx={{ borderColor: "divider" }} />
          <List>{renderItems(secondaryItems)}</List>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          p: 3,
          pb: isMobile ? 10 : 3,
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: mode === "dark" ? "grey.950" : "background.paper",
            color: "text.primary",
          }}
        >
          <BottomNavigation
            showLabels
            value={mobileItems.findIndex((item) => isActive(item.path))}
            onChange={(_, index: number) => {
              const item = mobileItems[index];
              if (item) {
                item.action();
              }
            }}
            sx={{
              bgcolor: "transparent",
              "& .MuiBottomNavigationAction-root": {
                color: "text.secondary",
              },
              "& .MuiBottomNavigationAction-root.Mui-selected": {
                color: "primary.main",
              },
            }}
          >
            {mobileItems.map((item) => (
              <BottomNavigationAction key={item.label} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};
