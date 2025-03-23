import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const verifyToken = async (req, res, next) => {
  // console.log("verify-token-hit");
  let token;

  // Extract token from cookies
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // Extract token from Authorization header (Bearer Token)
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Verified token",decoded);
   

    // Find the user by ID, excluding the password
    const user = await User.findById(decoded.id).select("-password");
    // console.log(user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email to access this resource" });
    }

    // Attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    console.error("🔴 Token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export default verifyToken;
