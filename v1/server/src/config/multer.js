import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// 🔥 Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat_files", // Cloudinary folder
    resource_type: "auto", // Auto-detect file type
    format: async (req, file) => file.mimetype.split("/")[1], // Keep file format
  },
});

// File filter to allow all file types
const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept all file types
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
