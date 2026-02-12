"use client";

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
      return "light";
    }

    const storedMode = globalThis.localStorage?.getItem("theme-mode");

    if (storedMode === "dark" || storedMode === "light") {
      return storedMode;
    }

    const prefersDark = globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  });

  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    globalThis.localStorage?.setItem("theme-mode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: blue[600],
          },
          secondary: {
            main: mode === "dark" ? blue[200] : blue[50],
          },
        },
      }),
    [mode],
  );

  const colorModeValue = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ColorModeContext.Provider value={colorModeValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}
