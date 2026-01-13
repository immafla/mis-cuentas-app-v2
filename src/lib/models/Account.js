import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  name: String,
  balance: Number,
  type: { type: String, default: 'account' }, // To distinguish
  // Add other fields as needed
});

export default mongoose.models.Account || mongoose.model('Account', AccountSchema, 'MisCuentasApp');