import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Schema } from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String,  unique: true, sparse: true }, // For Google OAuth users
  avatar: { type: String, default:"https://cdn-icons-png.flaticon.com/128/1144/1144760.png" }, // Profile picture URL
  // friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  online: { type: Boolean, default: false },
  lastActive: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);