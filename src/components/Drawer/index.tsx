import * as React from "react";
import { usePathname } from "next/navigation";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NoteAltSharpIcon from "@mui/icons-material/NoteAltSharp";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";

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
  showSale: () => void;
  showAddBrand: () => void;
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
  showSale,
  showAddBrand,
  children,
}: MiniDrawerProps) => {
  const theme = useTheme();
  const pathname = usePathname();
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
    ],
    [showDashboard, showSale],
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
        label: "Nueva marca",
        icon: <AssignmentIcon />,
        action: showAddBrand,
        path: "/marcas",
      },
    ],
    [showAddBrand, showProduct],
  );

  const listItemButtonSx = React.useMemo(
    () => ({
      minHeight: 48,
      justifyContent: open ? "initial" : "center",
      px: 2.5,
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
    (path: string) =>
      path === "/" ? pathname === "/" : pathname?.startsWith(path),
    [pathname],
  );

  const renderItems = React.useCallback(
    (items: DrawerItem[]) =>
      items.map((item) => (
        <ListItem
          key={item.label}
          disablePadding
          sx={{ display: "block" }}
          onClick={item.action}
        >
          <ListItemButton
            sx={listItemButtonSx}
            selected={Boolean(isActive(item.path))}
          >
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
      <AppBar position="fixed" open={open}>
        <Toolbar>
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
          <Typography variant="h6" noWrap component="div">
            Y a beber!
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider />
        <List>{renderItems(mainItems)}</List>
        <Divider />
        <List>{renderItems(secondaryItems)}</List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          p: 3,
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
};
