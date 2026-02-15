import mongoose, { Document, Schema } from "mongoose";

export interface ILotItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  remainingQuantity: number;
  purchasePrice: number;
  totalCost: number;
}

export interface ILot extends Document {
  receivedAt: Date;
  supplier: mongoose.Types.ObjectId;
  items: ILotItem[];
  totalQuantity: number;
  totalCost: number;
}

const LotItemSchema = new Schema<ILotItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    remainingQuantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    totalCost: { type: Number, required: true },
  },
  { _id: false },
);

const LotSchema = new Schema<ILot>(
  {
    receivedAt: { type: Date, required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: { type: [LotItemSchema], required: true },
    totalQuantity: { type: Number, required: true },
    totalCost: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const modelName = "Lot";
const cachedLotModel = mongoose.models[modelName] as mongoose.Model<ILot> | undefined;

if (cachedLotModel) {
  const hasItemsPath = Boolean(cachedLotModel.schema.path("items"));
  const hasLegacySingleProductPath = Boolean(cachedLotModel.schema.path("product"));

  if (!hasItemsPath || hasLegacySingleProductPath) {
    mongoose.deleteModel(modelName);
  }
}

export default (mongoose.models[modelName] as mongoose.Model<ILot>) ||
  mongoose.model<ILot>(modelName, LotSchema);
