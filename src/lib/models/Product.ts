import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand: mongoose.Types.ObjectId;
  amount: number;
  category: mongoose.Types.ObjectId;
  sale_price: string;
  bar_code: string;
  content?: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    amount: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Categories", required: true },
    sale_price: { type: String, required: true },
    bar_code: { type: String, required: true },
    content: { type: Number, required: false },
  },
  {
    timestamps: true, // Esto crea automáticamente createdAt y updatedAt
  },
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
