import mongoose, { Document, Schema } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  nit: string;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    nit: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema);
