"use client";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GoogleIcon from "@mui/icons-material/Google";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import bgYaBeberImage from "../../assets/images/bg-y-a-beber.jpg";

const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Panel izquierdo - Branding */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            px: 6,
            py: 8,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={bgYaBeberImage}
            alt="Fondo del panel de inicio de sesión"
            fill
            priority
            style={{ objectFit: "cover", zIndex: 0 }}
          />
          <Stack
            spacing={3}
            alignItems="center"
            sx={{ position: "relative", zIndex: 1, maxWidth: 380 }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.common.white, 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StorefrontIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography variant="h3" fontWeight={800} textAlign="center" lineHeight={1.2}>
              Mis Cuentas
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ opacity: 0.8, lineHeight: 1.7 }}>
              Controla tu inventario, registra ventas y gestiona tu negocio desde un solo lugar.
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Panel derecho - Login */}
      <Box
        sx={{
          flex: isMobile ? 1 : "0 0 480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: isMobile ? 2 : 6,
          py: isMobile ? 0 : 6,
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          {/* Logo mobile */}
          {isMobile && (
            <Stack spacing={1.5} alignItems="center" sx={{ mb: 5 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2.5,
                  bgcolor: "primary.main",
                  color: "common.white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StorefrontIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                Mis Cuentas
              </Typography>
            </Stack>
          )}

          <Box>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Iniciar sesión
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Accede a tu panel de administración
                </Typography>
              </Box>

              <Divider />

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={() => signIn("google", { callbackUrl: "/" })}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                Continuar con Google
              </Button>

              <Typography variant="caption" color="text.disabled" textAlign="center">
                Solo cuentas autorizadas pueden acceder al sistema.
              </Typography>
            </Stack>
          </Box>

          <Typography
            variant="caption"
            color="text.disabled"
            textAlign="center"
            display="block"
            sx={{ mt: 4 }}
          >
            Mis Cuentas &middot; Software de gestión para tu negocio
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
