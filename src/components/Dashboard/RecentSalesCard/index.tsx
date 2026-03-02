import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import React, { useState } from "react";

import { DashboardSale } from "../interfaces";

type RecentSalesCardProps = {
  glassCardSx: SxProps<Theme>;
  isExpanded: boolean;
  onToggle: () => void;
  isLoading: boolean;
  recentSales: DashboardSale[];
};

export const RecentSalesCard = React.forwardRef<HTMLDivElement, RecentSalesCardProps>(
  ({ glassCardSx, isExpanded, onToggle, isLoading, recentSales }, ref) => {
    const [selectedSale, setSelectedSale] = useState<DashboardSale | null>(null);

    const handleOpenSaleDetail = (sale: DashboardSale) => {
      setSelectedSale(sale);
    };

    const handleCloseSaleDetail = () => {
      setSelectedSale(null);
    };

    return (
      <>
        <Paper
          ref={ref}
          onClick={onToggle}
          elevation={0}
          sx={{
            ...glassCardSx,
            display: "flex",
            flexDirection: "column",
            maxHeight: { xs: 400, sm: 450, lg: "none" },
          }}
        >
          <Stack spacing={isExpanded ? 2 : 0} sx={{ flex: 1, minHeight: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ flexShrink: 0, minHeight: { xs: 38, sm: 42 } }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ventas recientes
                </Typography>
                <Chip label="Hoy" size="small" color="primary" variant="outlined" />
              </Stack>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle();
                }}
                sx={{
                  transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform .2s ease",
                }}
              >
                <ExpandMoreRoundedIcon />
              </IconButton>
            </Stack>
            <Collapse in={isExpanded} unmountOnExit sx={{ flex: 1, minHeight: 0 }}>
              <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                <Divider />
                {isLoading ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </Stack>
                ) : (
                  <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                    <List disablePadding>
                      {recentSales.length === 0 && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary="Sin ventas registradas"
                            secondary="Cuando se registren ventas aparecerán aquí"
                          />
                        </ListItem>
                      )}
                      {recentSales.map((sale, index) => (
                        <Box key={sale.id}>
                          <ListItem disablePadding>
                            <ListItemButton
                              data-no-toggle="true"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenSaleDetail(sale);
                              }}
                              sx={{
                                px: 2,
                                borderRadius: 1,
                                "&:hover": { backgroundColor: "action.hover" },
                              }}
                            >
                              <ListItemText
                                primary={sale.customer}
                                secondary={`${sale.items} items · ${new Date(sale.soldAt).toLocaleString("es-CO")} · Haz click para ver detalle`}
                              />
                              <Typography sx={{ fontWeight: 600 }}>{`$ ${sale.total}`}</Typography>
                            </ListItemButton>
                          </ListItem>
                          {index < recentSales.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            </Collapse>
          </Stack>
        </Paper>

        <Dialog
          open={Boolean(selectedSale)}
          onClose={handleCloseSaleDetail}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Detalle de venta</DialogTitle>
          <DialogContent>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedSale
                  ? `${new Date(selectedSale.soldAt).toLocaleString("es-CO")} · ${selectedSale.items} items`
                  : ""}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSale
                  ? `Venta: $ ${selectedSale.total} · Costo: $ ${selectedSale.totalCost} · Utilidad: $ ${selectedSale.totalProfit}`
                  : ""}
              </Typography>
              <Divider />
              <List disablePadding>
                {selectedSale?.soldItems.map((item, index) => (
                  <Box key={`${item.barCode}-${index}`}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity} x $ ${item.unitPrice} · Compra: $ ${item.unitCost} · Utilidad: $ ${item.lineProfit} · Código: ${item.barCode}`}
                      />
                      <Typography sx={{ fontWeight: 600 }}>{`$ ${item.lineTotal}`}</Typography>
                    </ListItem>
                    {selectedSale.soldItems.length - 1 > index && <Divider />}
                  </Box>
                ))}
              </List>
              {!selectedSale?.soldItems.length && (
                <Typography variant="body2" color="text.secondary">
                  Esta venta no tiene ítems disponibles.
                </Typography>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 600 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>{`$ ${selectedSale?.total ?? 0}`}</Typography>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

RecentSalesCard.displayName = "RecentSalesCard";
