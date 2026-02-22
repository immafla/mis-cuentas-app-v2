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
import Paper from "@mui/material/Paper";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NoteAltSharpIcon from "@mui/icons-material/NoteAltSharp";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut, useSession } from "next-auth/react";
import { useColorMode } from "../ThemeRegistry";

const drawerWidth = 240;
const BOTTOM_NAV_HEIGHT = 56;

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
  showCategories: () => void;
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
  showCategories,
  children,
}: MiniDrawerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const { data: session } = useSession();
  const { mode, toggleColorMode } = useColorMode();
  const [open, setOpen] = React.useState(true);
  const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<null | HTMLElement>(null);
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
        label: "Marcas",
        icon: <AssignmentIcon />,
        action: showAddBrand,
        path: "/marcas",
      },
      {
        label: "Categorías",
        icon: <CategoryIcon />,
        action: showCategories,
        path: "/categorias",
      },
    ],
    [showAddBrand, showCategories, showProduct],
  );

  const logisticsItems = React.useMemo<DrawerItem[]>(
    () => [
      {
        label: "Lotes",
        icon: <Inventory2Icon />,
        action: showLots,
        path: "/lotes",
      },
      {
        label: "Proveedores",
        icon: <LocalShippingIcon />,
        action: showSuppliers,
        path: "/proveedores",
      },
    ],
    [showLots, showSuppliers],
  );

  const listItemButtonSx = React.useMemo(
    () => ({
      minHeight: 40,
      justifyContent: open ? "initial" : "center",
      px: 1.5,
      py: 0.5,
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

  const isSecondaryActive = [...secondaryItems, ...logisticsItems].some((item) =>
    isActive(item.path),
  );

  const mobileBottomNavValue = React.useMemo(() => {
    const mainIndex = mainItems.findIndex((item) => isActive(item.path));
    if (mainIndex !== -1) return mainIndex;
    if (isSecondaryActive) return mainItems.length; // "Más" tab
    return -1;
  }, [mainItems, isActive, isSecondaryActive]);

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", height: "100dvh", padding: 0, margin: 0 }}
      >
        <CssBaseline />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {children}
        </Box>

        <Paper
          elevation={8}
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: mode === "dark" ? "grey.950" : "background.paper",
            zIndex: theme.zIndex.appBar,
          }}
        >
          <BottomNavigation
            showLabels
            value={mobileBottomNavValue}
            onChange={(_, newValue: number) => {
              if (newValue < mainItems.length) {
                mainItems[newValue].action();
              }
            }}
            sx={{
              height: BOTTOM_NAV_HEIGHT,
              bgcolor: "transparent",
              "& .MuiBottomNavigationAction-root": {
                color: "text.secondary",
                minWidth: 0,
                px: 0.5,
              },
              "& .MuiBottomNavigationAction-root.Mui-selected": {
                color: "primary.main",
              },
            }}
          >
            {mainItems.map((item) => (
              <BottomNavigationAction key={item.label} label={item.label} icon={item.icon} />
            ))}
            <BottomNavigationAction
              label="Más"
              icon={<MoreHorizIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setMoreMenuAnchor(e.currentTarget);
              }}
            />
          </BottomNavigation>
        </Paper>

        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={() => setMoreMenuAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          slotProps={{
            paper: {
              sx: {
                bgcolor: mode === "dark" ? "grey.900" : "background.paper",
                minWidth: 200,
                mb: 1,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {userDisplayName}
            </Typography>
          </Box>

          <MenuItem
            onClick={() => {
              setMoreMenuAnchor(null);
              void signOut({ callbackUrl: "/login" });
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText>Cerrar sesión</ListItemText>
          </MenuItem>

          <MenuItem onClick={toggleColorMode}>
            <ListItemIcon>{mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
            <ListItemText>{mode === "dark" ? "Modo claro" : "Modo oscuro"}</ListItemText>
          </MenuItem>

          <Divider />

          {secondaryItems.map((item) => (
            <MenuItem
              key={item.label}
              selected={Boolean(isActive(item.path))}
              onClick={() => {
                item.action();
                setMoreMenuAnchor(null);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}

          <Divider />

          {logisticsItems.map((item) => (
            <MenuItem
              key={item.label}
              selected={Boolean(isActive(item.path))}
              onClick={() => {
                item.action();
                setMoreMenuAnchor(null);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  // --- DESKTOP LAYOUT ---
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
          {!open && (
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
                <Typography variant="caption" color="primary.main" noWrap>
                  Y a beber
                </Typography>
                <Typography variant="subtitle2" color="primary.main" noWrap>
                  {userDisplayName}
                </Typography>
              </Box>
            </Box>
          ) : (
            <IconButton color="inherit" aria-label="Cambiar modo de tema" onClick={toggleColorMode}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          )}

          {open && (
            <IconButton onClick={handleDrawerClose}>
              {isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
        </DrawerHeader>

        <Divider sx={{ borderColor: "divider" }} />
        <List>{renderItems(mainItems)}</List>
        <Divider sx={{ borderColor: "divider" }} />
        <List>{renderItems(secondaryItems)}</List>
        <Divider sx={{ borderColor: "divider" }} />
        <List>{renderItems(logisticsItems)}</List>

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
