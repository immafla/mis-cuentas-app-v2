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
        sx={{ py: 0, px: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <Stack spacing={0} sx={{ flex: 1, minHeight: 0 }}>
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
            handleDeleteRow={handleDeleteLot}
            setCreateModalOpen={setCreateModalOpen}
            showEditAction={false}
            showDeleteAction={true}
            actionsHeader="Eliminar lote"
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
