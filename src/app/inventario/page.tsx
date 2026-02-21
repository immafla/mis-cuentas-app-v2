"use client";

import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import CustomTable from "@/components/Table";

import { NewProductModal } from "./components/new-product";
import { useInventory } from "./hooks/useInventory";

export default function InventarioPage() {
  const {
    columns,
    createModalOpen,
    handleCancelRowEdits,
    handleCreateNewRow,
    handleDeleteRow,
    handleSaveRowEdits,
    isLoading,
    setCreateModalOpen,
    tableData,
  } = useInventory();

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
            enableGrouping={true}
            groupedColumnMode="reorder"
            initialGrouping={["category", "brand"]}
          />
          {createModalOpen && (
            <NewProductModal
              columns={columns}
              open={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              onSubmit={handleCreateNewRow}
            />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
