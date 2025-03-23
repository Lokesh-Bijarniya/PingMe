import dotenv from "dotenv";

dotenv.config();

// ✅ Google Login Controller
export const googleLogin = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user._id) {
      return res.status(401).json({ message: "Google authentication failed" });
    }

    // Generate tokens
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user's record
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie("accessToken", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || false,
      sameSite: "Lax",
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || false,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
    });

    // Redirect to frontend success page
    res.redirect(
      `${process.env.CLIENT_URL}/auth?token=${token}`
    );
    
  } catch (error) {
    console.error("Google login error:", error);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.redirect(`${process.env.CLIENT_URL}/auth?error=google_fail`);
  }
};

