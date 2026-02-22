"use client";

import { alpha, Box, Container, Paper, Stack, Typography, useTheme } from "@mui/material";

import CustomTable from "@/components/Table";
import { lotsColumns } from "./columns";
import { NewLotModal } from "./components/new-lot";
import { useLots } from "./hooks/useLots";
import { LotRow } from "@/services/lots.service";

const LotesPage = () => {
  const theme = useTheme();
  const {
    isLoading,
    createModalOpen,
    lots,
    suppliers,
    productOptions,
    setCreateModalOpen,
    handleCreateLot,
    handleDeleteLot,
  } = useLots();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          py: { xs: 1, sm: 2, md: 3 },
          px: { xs: 1, sm: 2 },
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Stack spacing={0} sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Lotes
              </Typography>
              <Typography color="text.secondary">
                Registra ingresos por lote y actualiza stock/costo de compra del producto.
              </Typography>
            </Box>

            <CustomTable
              columns={lotsColumns()}
              tableData={lots}
              isLoading={isLoading}
              handleSaveRowEdits={async () => undefined}
              handleCancelRowEdits={() => undefined}
              handleDeleteRow={handleDeleteLot}
              setCreateModalOpen={setCreateModalOpen}
              showEditAction={false}
              showDeleteAction={true}
              actionsHeader="Eliminar lote"
              searchPlaceholder="Buscar lotes"
              muiTableBodyRowProps={({ row }: { row: { original: LotRow } }) => ({
                hover: false,
                sx: {
                  bgcolor: row.original.isActive
                    ? alpha(theme.palette.success.light, 0.15)
                    : alpha(theme.palette.grey[500], 0.15),
                },
              })}
            />

            <NewLotModal
              open={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              suppliers={suppliers}
              productOptions={productOptions}
              onSubmit={handleCreateLot}
            />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LotesPage;
