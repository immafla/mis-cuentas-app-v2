import mongoose, { Schema, Document }  from 'mongoose';

export interface ICategoriesSchema extends Document {
  name: string;
}
const CategoriesSchema = new Schema<ICategoriesSchema>({
  name: { type: String, required: true },
});

export default mongoose.models.Categories || mongoose.model<ICategoriesSchema>('Categories', CategoriesSchema);