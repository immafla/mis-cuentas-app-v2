"use client";

import { Box, Container, Paper, Stack, Typography } from "@mui/material";
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
        </Paper>
      </Container>
    </Box>
  );
};

export default ProveedoresPage;
