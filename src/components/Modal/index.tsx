import React, { FC, JSX } from "react";
import { Button, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";

import Dialog from "@mui/material/Dialog";

export const Modal: FC<{
  title: string;
  children: JSX.Element | JSX.Element[];
  onClose: () => void;
  onAttemptClose?: () => boolean | Promise<boolean>;
  onSubmit: () => void | boolean | Promise<void | boolean>;
  open: boolean;
}> = ({ open, onClose, onAttemptClose, onSubmit, children, title }) => {
  const handleAttemptClose = async () => {
    const canClose = await onAttemptClose?.();

    if (canClose === false) {
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    const canClose = await onSubmit();

    if (canClose === false) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
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
          onClick={() => {
            void handleAttemptClose();
          }}
        >
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} variant="contained">
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
