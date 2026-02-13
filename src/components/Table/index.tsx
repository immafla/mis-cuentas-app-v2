import React from "react";
import {
  MaterialReactTable,
  // MaterialReactTableProps,
  // MRT_Cell,
  // MRT_ColumnDef,
  // MRT_Row,
} from "material-react-table";
import { Delete, Edit, AddCircle } from "@mui/icons-material";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { Button, Box, Tooltip, IconButton, useTheme, useMediaQuery } from "@mui/material";

const Table = ({
  columns,
  tableData,
  isLoading,
  handleSaveRowEdits,
  handleCancelRowEdits,
  handleDeleteRow,
  setCreateModalOpen,
}: {
  columns: any;
  tableData: any;
  isLoading: boolean;
  handleSaveRowEdits: any;
  handleCancelRowEdits: any;
  handleDeleteRow: any;
  setCreateModalOpen: any;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSaving, setIsSaving] = React.useState(false);

  const ToolbarActions = () => (
    <Button
      color="primary"
      onClick={() => setCreateModalOpen(true)}
      variant="contained"
      fullWidth={isMobile}
      sx={{ minWidth: isMobile ? "100%" : "auto" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <AddCircle color="secondary" />
        Nuevo
      </Box>
    </Button>
  );

  const RowActions = ({ row, table }: { row: any; table: any }) => (
    <Box sx={{ display: "flex", gap: isMobile ? "0.25rem" : "0.75rem" }}>
      <Tooltip arrow placement="left" title="Editar">
        <IconButton size={isMobile ? "small" : "medium"} onClick={() => table.setEditingRow(row)}>
          <Edit fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Tooltip>
      <Tooltip arrow placement="right" title="Eliminar">
        <IconButton
          size={isMobile ? "small" : "medium"}
          color="error"
          onClick={() => handleDeleteRow(row)}
        >
          <Delete fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <MaterialReactTable
      positionActionsColumn="last"
      muiTableBodyRowProps={{ hover: false }}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableHiding={false}
      enableRowOrdering={false}
      enableColumnFilters={false}
      enableSorting={false}
      initialState={{ density: "compact", showGlobalFilter: true }}
      editDisplayMode="modal"
      localization={MRT_Localization_ES}
      columns={columns}
      data={tableData}
      state={{ isLoading, isSaving }}
      muiTablePaperProps={{
        sx: {
          width: "100%",
          overflow: "hidden",
        },
      }}
      muiTableContainerProps={{
        sx: {
          maxWidth: "100%",
          overflowX: "auto",
        },
      }}
      muiTopToolbarProps={{
        sx: {
          px: isMobile ? 1 : 2,
          py: isMobile ? 1 : 1.5,
          gap: isMobile ? 1 : 1.5,
          flexWrap: "wrap",
        },
      }}
      muiCircularProgressProps={{
        color: "secondary",
        thickness: 5,
        size: 55,
      }}
      muiSkeletonProps={{
        animation: "pulse",
        height: 28,
      }}
      enableEditing
      onEditingRowSave={async (props) => {
        setIsSaving(true);
        try {
          await handleSaveRowEdits(props);
        } finally {
          setIsSaving(false);
        }
      }}
      onEditingRowCancel={handleCancelRowEdits}
      displayColumnDefOptions={{
        "mrt-row-actions": {
          header: "Editar producto",
          muiTableHeadCellProps: {
            align: "left",
          },
          size: 20,
        },
      }}
      muiSearchTextFieldProps={{
        placeholder: "Buscar productos",
        sx: {
          minWidth: isMobile ? "100%" : "260px",
          width: isMobile ? "100%" : "auto",
        },
        size: isMobile ? "small" : "medium",
        variant: "outlined",
      }}
      renderRowActions={({ row, table }) => <RowActions row={row} table={table} />}
      renderTopToolbarCustomActions={() => (
        <Box sx={{ width: isMobile ? "100%" : "auto" }}>
          <ToolbarActions />
        </Box>
      )}
    />
  );
};

export default Table;
