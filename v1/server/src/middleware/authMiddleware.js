// Middleware: verifyToken.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // console.log("hit verifyToken");
  let token;
  

  // Check for token in headers (Authorization: Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  }
  // console.log("token: " + token);

  // If no token in headers, check for token in cookies
  if (!token && req.cookies) {
    token = req.cookies.token; // Extract token from cookies
  }

  // If no token is found, return an error
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle invalid or expired tokens
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export default verifyToken;