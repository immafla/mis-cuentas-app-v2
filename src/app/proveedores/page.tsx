"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import CustomTable from "@/components/Table";
import { NewSupplierModal } from "./components/new-supplier";
import { useSuppliers } from "./hooks/useSuppliers";

const ProveedoresPage = () => {
  const {
    columns,
    tableData,
    isLoading,
    createModalOpen,
    setCreateModalOpen,
    handleSaveRowEdits,
    handleCancelRowEdits,
    handleDeleteRow,
    handleCreateSupplier,
  } = useSuppliers();

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
              Proveedores
            </Typography>
            <Typography color="text.secondary">Gestiona proveedores y su NIT.</Typography>
          </Box>

          <CustomTable
            columns={columns}
            tableData={tableData}
            isLoading={isLoading}
            handleSaveRowEdits={handleSaveRowEdits}
            handleCancelRowEdits={handleCancelRowEdits}
            handleDeleteRow={handleDeleteRow}
            setCreateModalOpen={setCreateModalOpen}
          />

          <NewSupplierModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateSupplier}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default ProveedoresPage;
