import mongoose, { Document, Schema } from "mongoose";

export interface IUserSettings extends Document {
  userEmail: string;
  preferences: {
    dashboard: {
      dailySalesGoal: number;
    };
  };
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userEmail: { type: String, required: true, unique: true, index: true, lowercase: true },
    preferences: {
      dashboard: {
        dailySalesGoal: { type: Number, required: true, default: 100000, min: 0 },
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);
