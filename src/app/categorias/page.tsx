"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import CustomTable from "@/components/Table";
import { NewCategoryModal } from "./components/new-category";
import { useCategories } from "./hooks/useCategories";

const CategoriasPage = () => {
  const {
    columns,
    tableData,
    isLoading,
    createModalOpen,
    setCreateModalOpen,
    handleSaveRowEdits,
    handleCancelRowEdits,
    handleDeleteRow,
    handleCreateCategory,
  } = useCategories();

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
              Categorías
            </Typography>
            <Typography color="text.secondary">Gestiona las categorías de productos.</Typography>
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

          <NewCategoryModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateCategory}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default CategoriasPage;
