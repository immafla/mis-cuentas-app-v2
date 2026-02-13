"use client";

import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import CustomTable from "@/components/Table";

import { NewProductModal } from "./components/new-product";
import NewProductAmount from "@/app/inventario/components/new-amount";
import { useInventory } from "./hooks/useInventory";

export default function InventarioPage() {
  const {
    addAmountModalOpen,
    columns,
    createModalOpen,
    handleCancelRowEdits,
    handleCreateNewRow,
    handleDeleteRow,
    handleSaveRowEdits,
    productSelected,
    isLoading,
    refreshProducts,
    setAddAmountModalOpen,
    setCreateModalOpen,
    tableData,
  } = useInventory();

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Inventario
            </Typography>
            <Typography color="text.secondary">Gestiona productos y existencias.</Typography>
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
          {createModalOpen && (
            <NewProductModal
              columns={columns}
              open={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              onSubmit={handleCreateNewRow}
              existingProductNames={tableData.map((product) => product.name)}
            />
          )}

          {addAmountModalOpen && (
            <NewProductAmount
              product={productSelected}
              open={addAmountModalOpen}
              onClose={() => setAddAmountModalOpen(false)}
              onSubmit={refreshProducts}
            />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
