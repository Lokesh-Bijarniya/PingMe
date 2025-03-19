import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js"; // Assuming you're using Cloudinary for image uploads
import validator from "validator"; 
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/verificationService.js"; 

// ✅ Update Profile

export const updateProfile = async (req, res) => {
  try {
    let avatarUrl = req.body.avatar;
    
    // ✅ Add proper error handling for file upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "pingme/profiles",
          resource_type: "auto",
        });
        avatarUrl = result.secure_url;

        // Optional: Delete old avatar from Cloudinary if necessary
        if (req.body.oldAvatar) {
          await cloudinary.uploader.destroy(req.body.oldAvatar); // oldAvatar is the public ID of the previous avatar
        }
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({ message: "Avatar upload failed" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: req.body.name, email: req.body.email, avatar: avatarUrl },
      { new: true, runValidators: true } // ✅ Add validation
    ).select("-password -refreshToken");



    res.json({ 
      user: updatedUser,
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ User Registration
export const registerUser = async (req, res) => {
  const { name, email, password, rememberMe } = req.body;

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // User exists but is not verified → Resend verification email
      const verificationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      user.verificationToken = verificationToken;
      user.verificationTokenExpires = Date.now() + 86400000; // 24 hours
      await user.save();

      const verificationLink = `${process.env.CLIENT_URL}/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
      await sendVerificationEmail(user.email, verificationLink);

      return res.status(200).json({ message: "Verification email resent. Please check your inbox." });
    }

    // Create new user (password hashing handled in model)
    user = new User({
      name,
      email,
      password,
      isVerified: false,
    });

    // Save the user first to generate `_id`
    await user.save();

    // Generate a verification token **after user creation**
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 86400000; // 24 hours
    await user.save();

    // Send verification email
    const verificationLink = `${process.env.CLIENT_URL}/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
    await sendVerificationEmail(user.email, verificationLink);

    return res.status(201).json({ message: "Verification email sent. Please check your inbox." });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ User Login (No refreshToken in response)
export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    // console.log("Login request received:", { email, password, rememberMe });

    const user = await User.findOne({ email }).select("+password");
    // console.log("User found:", user);

    if (!user || !user.password) {
      console.log("User not found or password missing in DB");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    // console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    // Generate tokens
    const token = user.generateToken(rememberMe ? "30d" : "1d");
    const refreshToken = user.generateRefreshToken(rememberMe);

    // Store the refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies for tokens
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });

    // Send response
    res.json({ user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, token, rememberMe });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get Logged-in User Info
export const getMe = async (req, res) => {
  console.log("get-me-hit")
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Refresh Token
// Backend refreshToken controller
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newToken = user.generateToken();

    res.cookie("token", newToken, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "Strict" 
    });
    
    // ✅ Return user data for frontend storage
    res.json({ 
      token: newToken,
      user: { 
        _id: user._id, name: user.name, email: user.email, avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};


// Forgot Password
// controllers/authController.js
export const passwordResetRequest = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Save reset token and expiration time to the user
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create the password reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send the password reset email using the sendVerificationEmail function
    await sendPasswordResetEmail(user.email, resetLink);

    // Return success response
    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Failed to process password reset request" });
  }
};


// Reset Password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find the user by reset token and check expiration
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update the user's password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    // Return success response
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};



// Change Password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user || !(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
export const logout = async (req, res) => {
  console.log("logout-hit");
  try {
    // 🛑 Check if the refresh token exists in cookies
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      // Clear cookies even if no refresh token is found
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.json({ message: "Logged out successfully" });
    }

    // 🔥 Find the user by refresh token and remove it from the database
    const user = await User.findOne({ refreshToken });
    if (!user) {
      // Clear cookies if no user is found with the refresh token
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res.json({ message: "Logged out successfully" });
    }

    // ✅ Remove refresh token from user record
    user.refreshToken = null;
    await user.save();

    // ✅ Clear cookies
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("🔥 Logout Error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};


// Search users by email or name
// controllers/userController.js
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query; // Query can be email or name
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Find users whose email or name matches the query
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: userId }, // Exclude the current user
    }).select("name email avatar online");

    res.json(users);
  } catch (error) {
    console.error("🔥 Error searching users:", error);
    res.status(500).json({ message: error.message });
  }
};



export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate a new verification token
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Increased from 1h to 24h
    );
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 86400000; // 24 hours
    await user.save();

    // Resend verification email
    const verificationLink = `${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, verificationLink);

    res.json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const verifyEmail = async (req, res) => {
  console.log("verifyEmail hit")
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Find the user by token
    const user = await User.findOne({
      _id: decoded.id,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token. Please request a new verification email." });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    // Generate access & refresh tokens
    const accessToken = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Store tokens in cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set true in production
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
    });

    // Return success response with user data
    res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      token : accessToken
    });

  } catch (error) {
    console.error("Verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token expired. Please request a new verification email." });
    }

    res.status(500).json({ message: "Verification failed" });
  }
};
