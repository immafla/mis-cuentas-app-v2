import { MRT_ColumnDef } from "material-react-table";

import { Product, ProductWithId } from "../../hooks/useInventory";

export type ProductFormValues = Record<string, string>;

export type SelectOption = {
  value: string;
  label: string;
};

export type NewProductModalProps = {
  columns: MRT_ColumnDef<ProductWithId>[];
  onClose: () => void;
  onSubmit: (values: Product) => void | Promise<void>;
  open: boolean;
  existingProductNames: string[];
};
