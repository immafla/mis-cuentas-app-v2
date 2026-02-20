"use client";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        px: 2,
        py: 4,
      }}
    >
      {/* Background Image filling the entire screen */}
      <Image
        src={bgYaBeberImage}
        alt="Fondo del panel de inicio de sesión"
        fill
        priority
        style={{ objectFit: "cover", zIndex: -2 }}
      />
      
      {/* Liquid Overlay: Gradient map for better liquid contrast and legibility */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)",
          zIndex: -1,
        }}
      />

      {/* Centered Liquid Glass Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <Box 
          sx={{ 
            width: "100%",
            // Liquid Glass Effect Base
            bgcolor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)", // For iOS Safari
            
            // Refined smooth borders
            borderRadius: 6,
            
            // Liquid edge lighting & deep shadows
            border: "1px solid rgba(255, 255, 255, 0.4)",
            borderTop: "1px solid rgba(255, 255, 255, 0.6)",
            borderLeft: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: `
              0 24px 64px rgba(0, 0, 0, 0.4), 
              inset 0 0 0 1px rgba(255, 255, 255, 0.2),
              inset 0 2px 20px rgba(255, 255, 255, 0.3)
            `,
            p: { xs: 4, sm: 5 },
            color: "common.white",
            position: "relative",
            overflow: "hidden",
            
            // Liquid glare effect using before pseudo-element
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "50%",
              height: "100%",
              background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)",
              transform: "skewX(-25deg)",
              animation: "liquidGlare 8s infinite",
              pointerEvents: "none",
            },
            "@keyframes liquidGlare": {
              "0%": { left: "-100%" },
              "20%": { left: "200%" },
              "100%": { left: "200%" }
            }
          }}
        >
          {/* Header & Logo */}
          <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "24px",
                // Liquid droplet style for logo
                background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderTop: "2px solid rgba(255, 255, 255, 0.8)",
                borderLeft: "2px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.25), inset 0 4px 12px rgba(255,255,255,0.5)",
                color: "common.white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StorefrontIcon sx={{ fontSize: 44, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight={800} sx={{ 
                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                letterSpacing: "-0.5px"
              }}>
                Mis Cuentas
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.9, 
                mt: 1,
                fontSize: "0.95rem",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)" 
              }}>
                Gestiona tu inventario y ventas
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Stack spacing={3}>
              <Divider sx={{ 
                borderColor: "rgba(255, 255, 255, 0.2)", 
                borderBottomStyle: "dashed" 
              }} />

              <Stack spacing={1} sx={{ textAlign: "center", mb: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                  Iniciar sesión
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Accede a tu panel de administración segura
                </Typography>
              </Stack>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<GoogleIcon sx={{ color: "common.black" }} />}
                onClick={() => signIn("google", { callbackUrl: "/" })}
                sx={{
                  py: 1.8,
                  borderRadius: 4,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  color: "common.black",
                  boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2), inset 0 -2px 0 0 rgba(0,0,0,0.05)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "common.white",
                    transform: "translateY(-3px) scale(1.02)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
                  },
                  "&:active": {
                    transform: "translateY(0) scale(0.98)",
                  }
                }}
              >
                Continuar con Google
              </Button>

              <Typography variant="caption" sx={{ opacity: 0.7, lineHeight: 1.5 }} textAlign="center" component="p">
                Solo cuentas autorizadas pueden acceder al sistema interno del negocio.
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          sx={{ 
            color: "rgba(255,255,255,0.7)", 
            mt: 4, 
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            fontWeight: 500
          }}
        >
          Mis Cuentas &middot; Software de gestión
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
