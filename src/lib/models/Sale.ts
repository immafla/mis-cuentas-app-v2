import mongoose, { Document, Schema } from "mongoose";

export interface ISaleItem {
  productId: string;
  name: string;
  barCode: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  lineTotal: number;
  lineCost: number;
  lineProfit: number;
  lotAllocations: Array<{
    lotId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export interface ISale extends Document {
  items: ISaleItem[];
  total: number;
  totalCost: number;
  totalProfit: number;
  totalItems: number;
  soldAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    barCode: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    lineCost: { type: Number, required: true },
    lineProfit: { type: Number, required: true },
    lotAllocations: {
      type: [
        {
          lotId: { type: String, required: true },
          quantity: { type: Number, required: true },
          unitCost: { type: Number, required: true },
          _id: false,
        },
      ],
      required: true,
      default: [],
    },
  },
  { _id: false },
);

const SaleSchema = new Schema<ISale>(
  {
    items: { type: [SaleItemSchema], required: true },
    total: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    soldAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
