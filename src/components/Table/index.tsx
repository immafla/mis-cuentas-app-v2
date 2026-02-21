import React from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  // MaterialReactTableProps,
  // MRT_Cell,
  // MRT_ColumnDef,
  // MRT_Row,
} from "material-react-table";
import { Delete, Edit, AddCircle } from "@mui/icons-material";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { Button, Box, Tooltip, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { useGlobalContext } from "@/context/global";

type ExpandedState = true | Record<string, boolean>;

const Table = ({
  columns,
  tableData,
  isLoading,
  handleSaveRowEdits,
  handleCancelRowEdits,
  handleDeleteRow,
  setCreateModalOpen,
  showCreateButton = true,
  showEditAction = true,
  showDeleteAction = true,
  actionsHeader = "Acciones",
  searchPlaceholder = "Buscar",
  muiTableBodyRowProps: customRowProps,
  enableGrouping = false,
  groupedColumnMode,
  initialGrouping,
}: {
  columns: any;
  tableData: any;
  isLoading: boolean;
  handleSaveRowEdits: any;
  handleCancelRowEdits: any;
  handleDeleteRow: any;
  setCreateModalOpen: any;
  showCreateButton?: boolean;
  showEditAction?: boolean;
  showDeleteAction?: boolean;
  actionsHeader?: string;
  searchPlaceholder?: string;
  muiTableBodyRowProps?: any;
  enableGrouping?: boolean;
  groupedColumnMode?: "reorder" | "remove" | false;
  initialGrouping?: string[];
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSaving, setIsSaving] = React.useState(false);
  const [grouping, setGrouping] = React.useState<string[]>(
    enableGrouping && initialGrouping ? initialGrouping : [],
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const tableId = React.useId();
  const { isLoadingTable, setTableSourceLoading, runWithTableLoading } = useGlobalContext();

  React.useEffect(() => {
    if (!enableGrouping) {
      setGrouping([]);
      setExpanded({});
      return;
    }

    if (initialGrouping?.length) {
      setGrouping(initialGrouping);
    }

    setExpanded({});
  }, [enableGrouping, initialGrouping]);

  React.useEffect(() => {
    const currentLoadingState = Boolean(isLoading || isSaving);
    setTableSourceLoading(tableId, currentLoadingState);

    return () => {
      setTableSourceLoading(tableId, false);
    };
  }, [isLoading, isSaving, setTableSourceLoading, tableId]);

  const ToolbarActions = () => {
    const isCollapsed = typeof expanded !== "boolean" && Object.keys(expanded).length === 0;

    return (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
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

        {enableGrouping && (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setExpanded(true)}
              disabled={expanded === true}
            >
              Expandir todo
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setExpanded({})}
              disabled={isCollapsed}
            >
              Colapsar todo
            </Button>
          </>
        )}
      </Box>
    );
  };

  const RowActions = ({ row, table }: { row: any; table: any }) => (
    <Box sx={{ display: "flex", gap: isMobile ? "0.25rem" : "0.75rem" }}>
      {showEditAction && (
        <Tooltip arrow placement="left" title="Editar">
          <IconButton size={isMobile ? "small" : "medium"} onClick={() => table.setEditingRow(row)}>
            <Edit fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      )}
      {showDeleteAction && (
        <Tooltip arrow placement="right" title="Eliminar">
          <IconButton
            size={isMobile ? "small" : "medium"}
            color="error"
            onClick={() => {
              void runWithTableLoading(async () => {
                await Promise.resolve(handleDeleteRow(row));
              });
            }}
          >
            <Delete fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  const table = useMaterialReactTable({
    positionActionsColumn: "last",
    muiTableBodyRowProps: customRowProps ?? { hover: false },
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableRowOrdering: false,
    enableColumnFilters: false,
    enableSorting: true,
    enableGrouping: enableGrouping,
    groupedColumnMode: enableGrouping ? groupedColumnMode : undefined,
    initialState: {
      density: "compact",
      showGlobalFilter: true,
      pagination: { pageIndex: 0, pageSize: 20 },
      ...(enableGrouping && initialGrouping ? { grouping: initialGrouping, expanded: {} } : {}),
    },
    editDisplayMode: "modal",
    localization: MRT_Localization_ES,
    columns,
    data: tableData,
    state: {
      isLoading: isLoading || isLoadingTable,
      isSaving,
      ...(enableGrouping ? { grouping } : {}),
      ...(enableGrouping ? { expanded } : {}),
    },
    onGroupingChange: enableGrouping ? setGrouping : undefined,
    onExpandedChange: enableGrouping ? setExpanded : undefined,
    muiTablePaperProps: {
      sx: {
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      },
    },
    muiTableContainerProps: {
      sx: {
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
        overflowY: "auto",
        flex: 1,
        minHeight: 0,
      },
    },
    muiTopToolbarProps: {
      sx: {
        px: isMobile ? 1 : 2,
        py: isMobile ? 1 : 1.5,
        gap: isMobile ? 1 : 1.5,
        flexWrap: "wrap",
        flexShrink: 0,
        ...(isMobile && {
          "& > .MuiBox-root": {
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 1,
            width: "100%",
            "& > *": {
              width: "100%",
              flex: "none",
            },
          },
          "& .MuiCollapse-root, & .MuiCollapse-root .MuiCollapse-wrapper, & .MuiCollapse-root .MuiCollapse-wrapperInner":
            {
              width: "100%",
            },
          "& .MuiCollapse-root .MuiTextField-root": {
            width: "100%",
          },
        }),
      },
    },
    muiBottomToolbarProps: {
      sx: {
        flexShrink: 0,
      },
    },
    muiCircularProgressProps: {
      color: "secondary",
      thickness: 5,
      size: 55,
    },
    muiSkeletonProps: {
      animation: "pulse",
      height: 28,
    },
    enableRowActions: showEditAction || showDeleteAction,
    enableStickyHeader: true,
    enableEditing: showEditAction,
    onEditingRowSave: showEditAction
      ? async (props) => {
          await runWithTableLoading(async () => {
            setIsSaving(true);
            try {
              await Promise.resolve(handleSaveRowEdits(props));
            } finally {
              setIsSaving(false);
            }
          });
        }
      : undefined,
    onEditingRowCancel: showEditAction ? handleCancelRowEdits : undefined,
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: actionsHeader,
        muiTableHeadCellProps: {
          align: "left",
        },
        size: 20,
      },
    },
    muiSearchTextFieldProps: {
      placeholder: searchPlaceholder,
      sx: {
        minWidth: isMobile ? "100%" : "260px",
        width: isMobile ? "100%" : "auto",
      },
      size: isMobile ? "small" : "medium",
      variant: "outlined",
    },
    renderRowActions:
      showEditAction || showDeleteAction
        ? ({ row, table }) => <RowActions row={row} table={table} />
        : undefined,
    renderTopToolbarCustomActions: showCreateButton
      ? () => (
          <Box sx={{ width: isMobile ? "100%" : "auto" }}>
            <ToolbarActions />
          </Box>
        )
      : undefined,
  });

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Table;
