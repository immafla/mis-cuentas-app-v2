import mongoose, { Schema, Document } from "mongoose";

export interface IBussinesCategorySchema extends Document {
  name: string;
}

const BussinesCategorySchema = new Schema<IBussinesCategorySchema>(
  {
    name: { type: String, required: true },
  },
  {
    collection: "business_categories",
  },
);

export default mongoose.models.BussinesCategory ||
  mongoose.model<IBussinesCategorySchema>("BussinesCategory", BussinesCategorySchema);
