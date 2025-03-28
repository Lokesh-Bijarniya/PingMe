import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: "https://cdn-icons-png.flaticon.com/128/1144/1144760.png" },
  refreshToken: { type: String, select: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  isActive: { type: Boolean, default: false },
  lastActive: Date,
}, { timestamps: true });

// ✅ Keep only necessary indexes
userSchema.index({ name: "text" });  // For searching by name
userSchema.index({ lastActive: -1 }); // For optimizing queries

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token (access token)
userSchema.methods.generateToken = function (rememberMe) {
  const expiresIn = rememberMe ? "30d" : "1d"; // ✅ Use longer expiry if "Remember Me" is checked
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn });
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function (rememberMe) {
  const expiresIn = rememberMe ? "60d" : "7d"; // ✅ Extend refresh token if "Remember Me" is checked
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
};


export default mongoose.model('User', userSchema);



