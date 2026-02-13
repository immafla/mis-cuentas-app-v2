import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand: string;
  amount: number;
  category: string;
  sale_price: string;
  bar_code: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    sale_price: { type: String, required: true },
    bar_code: { type: String, required: true },
  },
  {
    timestamps: true, // Esto crea automáticamente createdAt y updatedAt
  },
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
