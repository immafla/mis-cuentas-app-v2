import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import ThemeRegistry from "../components/ThemeRegistry";
import AppShell from "../components/AppShell";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { GlobalProvider } from "@/context/global";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mis Cuentas",
  description: "Mis cuentas app",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${montserrat.className} antialiased`}
        style={{ margin: 0 }}
      >
        <AuthSessionProvider>
          <GlobalProvider>
            <ThemeRegistry>
              <AppShell>{children}</AppShell>
            </ThemeRegistry>
          </GlobalProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
