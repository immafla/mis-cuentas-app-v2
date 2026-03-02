import React, { FC, JSX, useRef, useState } from "react";
import { Button, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import type { DialogProps } from "@mui/material/Dialog";

import Dialog from "@mui/material/Dialog";

export const Modal: FC<{
  title: string;
  children: JSX.Element | JSX.Element[];
  onClose: () => void;
  onAttemptClose?: () => boolean | Promise<boolean>;
  onSubmit: () => void | boolean | Promise<void | boolean>;
  open: boolean;
  fullWidth?: boolean;
  maxWidth?: DialogProps["maxWidth"];
}> = ({
  open,
  onClose,
  onAttemptClose,
  onSubmit,
  children,
  title,
  fullWidth = false,
  maxWidth = "sm",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const handleAttemptClose = async () => {
    if (isSubmitting) {
      return;
    }

    const canClose = await onAttemptClose?.();

    if (canClose === false) {
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitting || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const canClose = await onSubmit();

      if (canClose === false) {
        return;
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      onClose();
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      disableEscapeKeyDown={isSubmitting}
      onClose={(_, reason) => {
        if (isSubmitting || reason === "backdropClick") {
          return;
        }

        void handleAttemptClose();
      }}
    >
      <DialogTitle textAlign="center">{title}</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "400px" },
              gap: "1.5rem",
              pt: 1,
            }}
          >
            {children}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button
          disabled={isSubmitting}
          onClick={() => {
            void handleAttemptClose();
          }}
        >
          Cancel
        </Button>
        <Button color="primary" disabled={isSubmitting} onClick={handleSubmit} variant="contained">
          {isSubmitting ? "Guardando..." : "Aceptar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
