"use client";

import { Button, Paper, Stack, Typography } from "@mui/material";
import { alpha, keyframes, useTheme } from "@mui/material/styles";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const animatedGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const LoginPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: "100dvh",
        p: 2,
        background: `linear-gradient(-45deg,
          ${alpha(theme.palette.primary.main, 0.75)},
          ${alpha(theme.palette.secondary.main, 0.75)},
          ${alpha(theme.palette.info.main, 0.75)},
          ${alpha(theme.palette.success.main, 0.75)})`,
        backgroundSize: "300% 300%",
        animation: `${animatedGradient} 12s ease infinite`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 440,
          textAlign: "center",
          borderRadius: 3,
          backdropFilter: "blur(22px) saturate(170%)",
          WebkitBackdropFilter: "blur(22px) saturate(170%)",
          border: `1px solid ${alpha(theme.palette.common.white, 0.35)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.35),
          boxShadow: `
            0 10px 35px ${alpha(theme.palette.common.black, 0.2)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.45)}
          `,
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="overline" sx={{ letterSpacing: 2.2 }}>
            Mis Cuentas
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accede con tu cuenta de Google para entrar al sistema.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            sx={{
              py: 1.2,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Continuar con Google
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default LoginPage;
