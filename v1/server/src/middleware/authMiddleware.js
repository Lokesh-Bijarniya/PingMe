import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Community from "../models/communityModel.js";

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



// ✅ Middleware to Check if User is an Admin of the Community
const requireCommunityAdmin = async (req, res, next) => {
  try {
    const { id } = req.params; // Community ID
    const userId = req.user.id; // Authenticated user

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!community.admins.includes(userId)) {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    // ✅ User is an admin, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error("RBAC Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export {verifyToken,requireCommunityAdmin};
