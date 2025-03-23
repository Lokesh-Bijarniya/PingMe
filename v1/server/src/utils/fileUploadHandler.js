import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import sanitize from "sanitize-filename";
import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";
import Community from "../models/communityModel.js";
import User from "../models/userModel.js";

// ✅ Fix __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const handleFileUpload = async ({
  socket,
  io,
  type,
  id,
  userId,
  fileName,
  fileType,
  chunk,
  isLastChunk,
}) => {
  try {
    if (!socket.fileChunks) socket.fileChunks = {};
    if (!socket.fileChunks[id]) socket.fileChunks[id] = [];
    socket.fileChunks[id].push(Buffer.from(chunk, "base64"));

    if (isLastChunk) {
      const fileBuffer = Buffer.concat(socket.fileChunks[id]);
      const sanitizedFileName = sanitize(fileName);
      const tempFilePath = path.join(tempDir, sanitizedFileName);
      fs.writeFileSync(tempFilePath, fileBuffer);

      // Upload to Cloudinary
      const cloudinaryFolder = type === "chat" ? `chat_files/${id}` : `community_files/${id}`;
      const result = await cloudinary.uploader.upload(tempFilePath, {
        resource_type: "auto",
        folder: cloudinaryFolder,
      });

      fs.unlinkSync(tempFilePath);
      delete socket.fileChunks[id];

      // Get Chat or Community
      const chat = type === "chat" ? await Chat.findById(id) : await Community.findById(id).populate("chat");
      if (!chat) return socket.emit("ERROR", "Chat/Community not found");

      if (type === "community" && !chat.members.includes(userId)) {
        return socket.emit("ERROR", "Not a community member");
      }

      if (type === "chat" && !chat.participants.includes(userId)) {
        return socket.emit("ERROR", "Not part of this chat");
      }

      // Save Message
      const message = new Message({
        chat: chat.chat?._id || chat._id,
        sender: userId,
        content: "📎 File shared",
        attachment: result.secure_url,
        fileType,
        fileName,
        timestamp: new Date(),
        status: "sent",
      });

      await message.save();

      // Notify Chat or Community
      const sender = await User.findById(userId, "name avatar");
      const payload = {
        messageId: message._id,
        content: message.content,
        attachment: message.attachment,
        fileName,
        fileType,
        sender: { id: userId, name: sender.name, avatar: sender.avatar },
        timestamp: message.timestamp,
        chatId: chat.chat?._id || chat._id,
      };

      const eventName = type === "chat" ? "NEW_MESSAGE" : "NEW_COMMUNITY_MESSAGE";
      io.to(id).emit(eventName, payload); // ✅ FIX: Emit directly using `io`
    }
  } catch (error) {
    console.error("File upload error:", error);
    socket.emit("ERROR", { message: error.message });
  }
};

export default handleFileUpload;
