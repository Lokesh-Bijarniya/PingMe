import mongoose from "mongoose";
import Chat from "./models/chatModel.js"; // Adjust the path to your Chat model
import Message from "./models/messageModel.js"; // Adjust the path to your Message model

// Connect to MongoDB
mongoose.connect("mongodb+srv://Lokesh-Bijarniya:Sikar%40123@cluster0.2oyc6pu.mongodb.net/PingMe", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User IDs from your database
const userIds = {
  lokesh1: "67c047c707cb62ae6de32959", // Lokesh Bijarniya
  lokesh2: "67ba209c7638e187a6becb4e", // lokesh
  abc: "67ba20e07638e187a6becb54", // abc
  abcd: "67ba250cef3a81dfd8374266", // abcdd
  xyz: "67be15df238adcbefc75381f", // xyz
  xyze: "67be16c0238adcbefc75382a", // xyze
};

// Dummy chat data
const dummyChats = [
  {
    participants: [userIds.lokesh1, userIds.lokesh2], // Chat between Lokesh1 and Lokesh2
    lastMessage: null,
    unreadCount: { [userIds.lokesh1]: 0, [userIds.lokesh2]: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    participants: [userIds.lokesh1, userIds.abc], // Chat between Lokesh1 and abc
    lastMessage: null,
    unreadCount: { [userIds.lokesh1]: 0, [userIds.abc]: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    participants: [userIds.lokesh1, userIds.abcd], // Chat between Lokesh1 and abcdd
    lastMessage: null,
    unreadCount: { [userIds.lokesh1]: 0, [userIds.abcd]: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    participants: [userIds.lokesh1, userIds.xyz], // Chat between Lokesh1 and xyz
    lastMessage: null,
    unreadCount: { [userIds.lokesh1]: 0, [userIds.xyz]: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Dummy message data
const dummyMessages = [];

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing chats and messages
    await Chat.deleteMany({});
    await Message.deleteMany({});

    // Insert dummy chats
    const createdChats = await Chat.insertMany(dummyChats);

    // Map chat IDs for easier reference
    const chatMap = {};
    createdChats.forEach((chat, index) => {
      chatMap[`chat${index + 1}Id`] = chat._id;
    });

    // Add dummy messages for each chat
    dummyMessages.push(
      {
        chat: chatMap.chat1Id, // Chat between Lokesh1 and Lokesh2
        sender: userIds.lokesh1,
        content: "Hey Lokesh2, how are you?",
        timestamp: new Date(),
        status: "sent",
        readBy: [],
      },
      {
        chat: chatMap.chat1Id,
        sender: userIds.lokesh2,
        content: "I'm good, thanks! What about you?",
        timestamp: new Date(),
        status: "sent",
        readBy: [],
      },
      {
        chat: chatMap.chat2Id, // Chat between Lokesh1 and abc
        sender: userIds.lokesh1,
        content: "Hi abc, let's meet tomorrow.",
        timestamp: new Date(),
        status: "sent",
        readBy: [],
      },
      {
        chat: chatMap.chat2Id,
        sender: userIds.abc,
        content: "Sure, what time?",
        timestamp: new Date(),
        status: "sent",
        readBy: [],
      },
      {
        chat: chatMap.chat3Id, // Chat between Lokesh1 and abcdd
        sender: userIds.lokesh1,
        content: "Did you finish the project?",
        timestamp: new Date(),
        status: "sent",
        readBy: [],
      },
      {
        chat: chatMap.chat3Id,
        sender: userIds.abcd,
        content: "Almost done, will send it by evening.",
        timestamp: new Date(),
        status: "sent",
        readBy: [],
      }
    );

    // Insert dummy messages
    await Message.insertMany(dummyMessages);

    console.log("Dummy chats and messages inserted successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedDatabase();