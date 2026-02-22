"use client";

import React from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { MRT_Row } from "material-react-table";
import CustomTable from "@/components/Table";

import { NewProductModal } from "./components/new-product";
import { ProductWithId, useInventory } from "./hooks/useInventory";

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
              muiTableBodyRowProps={({ row }: { row: MRT_Row<ProductWithId> }) => ({
                hover: true,
                onClick: (event: React.MouseEvent<HTMLElement>) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("button, a, input, textarea, [role='button']")) {
                    return;
                  }

                  if (row?.getCanExpand?.()) {
                    row.toggleExpanded();
                  }
                },
                sx: {
                  cursor: row?.getCanExpand?.() ? "pointer" : "default",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                },
              })}
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
        </Paper>
      </Container>
    </Box>
  );
}
