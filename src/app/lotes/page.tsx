"use client";

import { Box, Container, Stack, Typography } from "@mui/material";

import CustomTable from "@/components/Table";
import { lotsColumns } from "./columns";
import { NewLotModal } from "./components/new-lot";
import { useLots } from "./hooks/useLots";

const LotesPage = () => {
  const {
    isLoading,
    createModalOpen,
    lots,
    suppliers,
    productOptions,
    setCreateModalOpen,
    handleCreateLot,
  } = useLots();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "screen",
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ py: 0, px: 0 }}>
        <Stack spacing={0}>
          <Box>
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
            handleDeleteRow={async () => undefined}
            setCreateModalOpen={setCreateModalOpen}
            showEditAction={false}
            showDeleteAction={false}
            actionsHeader=""
            searchPlaceholder="Buscar lotes"
          />

          <NewLotModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            suppliers={suppliers}
            productOptions={productOptions}
            onSubmit={handleCreateLot}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default LotesPage;
