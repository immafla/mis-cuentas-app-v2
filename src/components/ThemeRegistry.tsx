"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: blue[600],
    },
    secondary: {
      main: blue[50],
    },
  },
});

export default function ThemeRegistry({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
