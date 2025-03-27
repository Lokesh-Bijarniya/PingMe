// models/communityModel.js
import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 3,
    maxlength: 50 
  },
  description: { 
    type: String, 
    maxlength: 500 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  }],
  admins: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  }],
  chat: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Chat",
    required: true 
  },
  avatar: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// ✅ Index for faster community search
communitySchema.index({ name: "text", description: "text" });

// ✅ Index for retrieving communities by created date
communitySchema.index({ createdAt: -1 });


const Community = mongoose.model("Community", communitySchema);
export default Community;