"use client";

import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import CustomTable from "@/components/Table";
import { NewBrandModal } from "./components/new-brand";
import { useBrands } from "./hooks/useBrands";

const MarcasPage = () => {
  const {
    columns,
    tableData,
    isLoading,
    createModalOpen,
    setCreateModalOpen,
    handleSaveRowEdits,
    handleCancelRowEdits,
    handleDeleteRow,
    handleCreateNewRow,
  } = useBrands();

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
                Marcas
              </Typography>
              <Typography color="text.secondary">Gestiona las marcas.</Typography>
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
            <NewBrandModal
              columns={columns}
              open={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              onSubmit={handleCreateNewRow}
            />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default MarcasPage;
