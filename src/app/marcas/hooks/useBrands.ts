import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialReactTableProps, MRT_Cell, MRT_ColumnDef, MRT_Row } from "material-react-table";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { validateRequired } from "@/utils";
import { brandColumns } from "../columns";
import {
  createBrand,
  deleteBrandById,
  updateBrandById,
  getAllBrands,
} from "@/services/brands.service";

const MySwal = withReactContent(Swal);

type BrandRow = {
  _id?: string;
  name: string;
};

export const useBrands = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<BrandRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    (async () => {
      setIsLoading(true);
      const result = await getAllBrands();

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

  const handleSaveRowEdits: MaterialReactTableProps<BrandRow>["onEditingRowSave"] = async ({
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

    const result = await updateBrandById(String(row.original._id ?? ""), values.name);

    if (result.success && result.data) {
      setTableData((prev) =>
        prev
          .map((item, index) => (index === row.index ? { ...item, name: result.data.name } : item))
          .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "es")),
      );
      exitEditingMode();
      await new Promise((resolve) => setTimeout(resolve, 180));
      await MySwal.fire({
        icon: "success",
        title: "Marca actualizada",
        text: "Los cambios se guardaron correctamente.",
        timer: 1600,
        showConfirmButton: false,
      });
      return;
    }

    await MySwal.fire({
      icon: "error",
      title: "Error al actualizar",
      text: result.message ?? result.error ?? "No fue posible actualizar la marca.",
    });
  };

  const handleDeleteRow = useCallback(async (row: MRT_Row<BrandRow>) => {
    const confirmDelete = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar marca?",
      text: `Se eliminará la marca ${row.getValue("name")}. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    const rawBrandId = row.original._id;
    const brandId = rawBrandId ? String(rawBrandId) : "";

    if (!brandId || brandId === "[object Object]") {
      await MySwal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: "No se encontró un id válido para la marca. Recarga la tabla e intenta de nuevo.",
      });
      return;
    }

    const result = await deleteBrandById(brandId);

    if (result.success) {
      setTableData((prev) => prev.filter((_, index) => index !== row.index));
      await MySwal.fire({
        icon: "success",
        title: "Marca eliminada",
        text: "La marca se eliminó correctamente.",
        timer: 1600,
        showConfirmButton: false,
      });
      return;
    }

    await MySwal.fire({
      icon: "error",
      title: "Error al eliminar",
      text: result.message ?? result.error ?? "No fue posible eliminar la marca.",
    });
  }, []);

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const getCommonEditTextFieldProps = useCallback(
    (cell: unknown) => {
      const typedCell = cell as MRT_Cell<BrandRow>;
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

  const handleCreateNewRow = async (values: BrandRow): Promise<boolean> => {
    if (!values.name?.trim()) {
      return false;
    }

    try {
      setIsLoading(true);
      const result = await createBrand(values.name);

      if (result.success && result.data) {
        setTableData((prev) =>
          [...prev, result.data].sort((a, b) =>
            String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"),
          ),
        );
        setCreateModalOpen(false);
        await MySwal.fire({
          icon: "success",
          title: "Marca creada",
          text: "La marca se guardó correctamente.",
          timer: 1600,
          showConfirmButton: false,
        });
        return true;
      }

      await MySwal.fire({
        icon: "error",
        title: "Error al crear",
        text: result.message ?? result.error ?? "No fue posible crear la marca.",
      });
      return false;
    } catch (error) {
      await MySwal.fire({
        icon: "error",
        title: "Error al crear",
        text: error instanceof Error ? error.message : "No fue posible crear la marca.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<MRT_ColumnDef<BrandRow>[]>(
    () => brandColumns(getCommonEditTextFieldProps),
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
    handleCreateNewRow,
  };
};
