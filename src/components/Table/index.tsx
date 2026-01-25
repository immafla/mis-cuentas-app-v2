import React from "react";
import {
    MaterialReactTable,
    // MaterialReactTableProps,
    // MRT_Cell,
    // MRT_ColumnDef,
    // MRT_Row,
  } from 'material-react-table';
import { Delete, Edit, AddCircle } from '@mui/icons-material';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import {
    Button,
    Box,
    Tooltip,
    IconButton,
} from '@mui/material'

const Table = ({
  columns,
  tableData,
  isLoading,
  handleSaveRowEdits,
  handleCancelRowEdits,
  handleDeleteRow,
  setCreateModalOpen,
}:{
  columns: any;
  tableData: any;
  isLoading: boolean;
  handleSaveRowEdits: any;
  handleCancelRowEdits: any;
  handleDeleteRow: any;
  setCreateModalOpen: any;
}) => {

  const ToolbarActions = () => (
    <Button
      color="primary"
      onClick={() => setCreateModalOpen(true)}
      variant="contained"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "left",
          justifyContent: "left",
          gap: "0.5rem",
        }}
      >
        <AddCircle color="secondary" />
        Nuevo
      </Box>
    </Button>
  )

  const RowActions = ({ row, table }: { row: any; table: any }) => (
    <Box sx={{ display: "flex", gap: "1rem" }}>
      <Tooltip arrow placement="left" title="Editr">
        <IconButton onClick={() => table.setEditingRow(row)}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip arrow placement="right" title="Delete">
        <IconButton color="error" onClick={() => handleDeleteRow(row)}>
          <Delete />
        </IconButton>
      </Tooltip>
    </Box>
  )

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
      initialState={{ density: "compact" }}
      editDisplayMode="modal"
      localization={MRT_Localization_ES}
      columns={columns}
      data={tableData}
      state={{ isLoading }}
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
      onEditingRowSave={handleSaveRowEdits}
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
        sx: { minWidth: "400px" },
        variant: "outlined",
      }}
      renderRowActions={({ row, table }) => (
        <RowActions row={row} table={table} />
      )}
      renderTopToolbarCustomActions={() => <ToolbarActions />}
    />
  );
};

export default Table;
