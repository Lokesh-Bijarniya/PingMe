import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';



// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id); // Generate JWT token
    res.cookie('token', token, { httpOnly: true }); // Set token as HTTP-only cookie
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar,  token }); // Include token in response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id.toString());

    // Set the token as an HTTP-only cookie
    res.cookie('token', token, { httpOnly: true, secure: false });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }; 

    // Send the token in the response body for local storage
    res.json({userData, token});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


// Middleware to verify the token and fetch user data
const getMe = async (req, res) => {
  try {
    let token;

    // Check if the token is provided in the Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Extract the token after "Bearer"
    }

    
    // If no token is found in the header, check for it in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token; // Extract the token from cookies
    }


    // console.log("Cookie Token:", token);


    // If no token is found in either place, return an error
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database using the decoded ID
    const user = await User.findById(decoded.id).select('-password'); // Exclude sensitive fields like password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }; 

    res.json({userData, token});
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    let avatarUrl = req.body.avatar;

    // Upload image to Cloudinary if a new image is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pingme/profiles',
      });
      console.log("Uploaded image to Cloudinary", result.secure_url);
      avatarUrl = result.secure_url;
    }

 
    // Update user in the database
    const userData = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, avatar: avatarUrl },
      { new: true }
    ).select('-password');

    // Generate a new token
    const token = generateToken(userData._id);

    console.log("Updated User Data:", userData);
    console.log("New Token:", token);

    // Return the updated user data and new token
    res.json({ userData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// controllers/userController.js
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      message: "Password updated successfully",
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar, // If you have an avatar field
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

  // controllers/userController.js

// Delete Account
const deleteAccount = async (req, res) => {
    try {
      // Delete user from the database
      await User.findByIdAndDelete(req.user.id);
  
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };




  export const addFriend = async (req, res) => {
    const { userId, friendEmail } = req.body;
    try {
        const user = await User.findById(userId);
        const friend = await User.findOne({ email: friendEmail });

        if (!friend) return res.status(404).json({ message: "Friend not found!" });

        if (!user.friends.includes(friend._id)) {
            user.friends.push(friend._id);
            friend.friends.push(user._id);
            await user.save();
            await friend.save();
        }

        res.json({ message: "Friend added!", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate("friends", "name email");
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

export { registerUser, loginUser, getMe, updateProfile, changePassword, deleteAccount };