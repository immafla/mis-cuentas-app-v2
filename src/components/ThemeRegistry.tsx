"use client";

import { CssBaseline } from "@mui/material";
import { blue } from "@mui/material/colors";
import { createTheme, PaletteMode, ThemeProvider } from "@mui/material/styles";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export const useColorMode = () => {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("useColorMode must be used within ThemeRegistry");
  }

  return context;
};

export default function ThemeRegistry({ children }: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    if (globalThis.window === undefined) {
      return "dark";
    }

    const storedMode = globalThis.localStorage?.getItem("theme-mode");

    if (storedMode === "dark" || storedMode === "light") {
      return storedMode;
    }

    return "dark";
  });

  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    globalThis.localStorage?.setItem("theme-mode", mode);
  }, [mode]);

  const darkPalette = {
    primary: {
      main: "#dfee3f",
      light: "#e9f272",
      dark: "#e4f05b",
      contrastText: "#000000",
    },
    secondary: {
      main: "#f5f7b0",
      light: "#f1f59c",
      dark: "#edf488",
      contrastText: "#000000",
    },
    success: {
      main: "#22946e",
      light: "#47d5a6",
      dark: "#22946e",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#a87a2a",
      light: "#d7ac61",
      dark: "#a87a2a",
      contrastText: "#ffffff",
    },
    error: {
      main: "#9c2121",
      light: "#d94a4a",
      dark: "#9c2121",
      contrastText: "#ffffff",
    },
    info: {
      main: "#21498a",
      light: "#4077d1",
      dark: "#21498a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#121212",
      paper: "#282828",
    },
    text: {
      primary: "#ffffff",
      secondary: "#8b8b8b",
    },
    divider: "#3f3f3f",
    action: {
      hover: "#39382e",
      selected: "#4e4e45",
      disabledBackground: "#65655c",
    },
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette:
          mode === "dark"
            ? {
                mode,
                ...darkPalette,
              }
            : {
                mode,
                primary: {
                  main: blue[600],
                },
                secondary: {
                  main: blue[50],
                },
              },
        typography: {
          fontFamily: "var(--font-montserrat), sans-serif",
        },
        components: {
          MuiCssBaseline: {
            styleOverrides:
              mode === "dark"
                ? {
                    ":root": {
                      "--clr-dark-a0": "#000000",
                      "--clr-light-a0": "#ffffff",
                      "--clr-primary-a0": "#dfee3f",
                      "--clr-primary-a10": "#e4f05b",
                      "--clr-primary-a20": "#e9f272",
                      "--clr-primary-a30": "#edf488",
                      "--clr-primary-a40": "#f1f59c",
                      "--clr-primary-a50": "#f5f7b0",
                      "--clr-surface-a0": "#121212",
                      "--clr-surface-a10": "#282828",
                      "--clr-surface-a20": "#3f3f3f",
                      "--clr-surface-a30": "#575757",
                      "--clr-surface-a40": "#717171",
                      "--clr-surface-a50": "#8b8b8b",
                      "--clr-surface-tonal-a0": "#242419",
                      "--clr-surface-tonal-a10": "#39382e",
                      "--clr-surface-tonal-a20": "#4e4e45",
                      "--clr-surface-tonal-a30": "#65655c",
                      "--clr-surface-tonal-a40": "#7d7d75",
                      "--clr-surface-tonal-a50": "#96958f",
                      "--clr-success-a0": "#22946e",
                      "--clr-success-a10": "#47d5a6",
                      "--clr-success-a20": "#9ae8ce",
                      "--clr-warning-a0": "#a87a2a",
                      "--clr-warning-a10": "#d7ac61",
                      "--clr-warning-a20": "#ecd7b2",
                      "--clr-danger-a0": "#9c2121",
                      "--clr-danger-a10": "#d94a4a",
                      "--clr-danger-a20": "#eb9e9e",
                      "--clr-info-a0": "#21498a",
                      "--clr-info-a10": "#4077d1",
                      "--clr-info-a20": "#92b2e5",
                    },
                  }
                : {
                    ":root": {},
                  },
          },
        },
      }),
    [mode],
  );

  const colorModeValue = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ColorModeContext.Provider value={colorModeValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
