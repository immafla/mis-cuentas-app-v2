import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
}

const BrandSchema = new Schema<IBrand>({
  name: { type: String, required: true },
});

export default mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
