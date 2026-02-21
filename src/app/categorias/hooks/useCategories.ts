import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialReactTableProps, MRT_Cell, MRT_ColumnDef, MRT_Row } from "material-react-table";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { validateRequired } from "@/utils";
import { categoryColumns, CategoryTableRow } from "../columns";
import {
  createCategory,
  deleteCategoryById,
  getAllCategories,
  updateCategoryById,
} from "@/services/categories.service";

const MySwal = withReactContent(Swal);

export const useCategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<CategoryTableRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const result = await getAllCategories();
      if (active && result.success && result.data) {
        setTableData(result.data);
      }

      if (active) {
        setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSaveRowEdits: MaterialReactTableProps<CategoryTableRow>["onEditingRowSave"] = async ({
    exitEditingMode,
    row,
    values,
  }) => {
    if (Object.keys(validationErrors).length) {
      await MySwal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Revisa los campos antes de guardar.",
      });
      return;
    }

    const result = await updateCategoryById(String(row.original._id ?? ""), {
      name: String(values.name ?? ""),
    });

    if (!result.success || !result.data) {
      await MySwal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: result.message ?? result.error ?? "No fue posible actualizar la categoría.",
      });
      return;
    }

    setTableData((prev) =>
      prev
        .map((item, index) => (index === row.index ? result.data : item))
        .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "es")),
    );
    exitEditingMode();
    await MySwal.fire({
      icon: "success",
      title: "Categoría actualizada",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const handleDeleteRow = useCallback(async (row: MRT_Row<CategoryTableRow>) => {
    const confirmDelete = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar categoría?",
      text: `Se eliminará ${row.getValue("name")}.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    const result = await deleteCategoryById(String(row.original._id ?? ""));

    if (!result.success) {
      await MySwal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: result.message ?? result.error ?? "No fue posible eliminar la categoría.",
      });
      return;
    }

    setTableData((prev) => prev.filter((_, index) => index !== row.index));
    await MySwal.fire({
      icon: "success",
      title: "Categoría eliminada",
      timer: 1400,
      showConfirmButton: false,
    });
  }, []);

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const getCommonEditTextFieldProps = useCallback(
    (cell: unknown) => {
      const typedCell = cell as MRT_Cell<CategoryTableRow>;
      return {
        error: !!validationErrors[typedCell.id],
        helperText: validationErrors[typedCell.id],
        onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
          const isValid = validateRequired(event.target.value);

          if (!isValid) {
            setValidationErrors((prev) => ({
              ...prev,
              [typedCell.id]: `${typedCell.column.columnDef.header} es obligatorio`,
            }));
            return;
          }

          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[typedCell.id];
            return next;
          });
        },
      };
    },
    [validationErrors],
  );

  const handleCreateCategory = useCallback(async (values: { name: string }): Promise<boolean> => {
    if (!values.name?.trim()) {
      return false;
    }

    const result = await createCategory(values.name);

    if (!result.success || !result.data) {
      await MySwal.fire({
        icon: "error",
        title: "Error al crear",
        text: result.message ?? result.error ?? "No fue posible crear la categoría.",
        didOpen: (popup) => {
          popup.parentElement?.style.setProperty("z-index", "1600");
        },
      });
      return false;
    }

    setTableData((prev) =>
      [...prev, result.data].sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"),
      ),
    );
    setCreateModalOpen(false);
    await MySwal.fire({
      icon: "success",
      title: "Categoría creada",
      timer: 1400,
      showConfirmButton: false,
    });
    return true;
  }, []);

  const columns = useMemo<MRT_ColumnDef<CategoryTableRow>[]>(
    () => categoryColumns(getCommonEditTextFieldProps),
    [getCommonEditTextFieldProps],
  );

  return {
    columns,
    tableData,
    isLoading,
    createModalOpen,
    setCreateModalOpen,
    handleSaveRowEdits,
    handleCancelRowEdits,
    handleDeleteRow,
    handleCreateCategory,
  };
};
