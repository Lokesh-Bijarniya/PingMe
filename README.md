# 📱 PingMe App - Real-Time Messaging App

![PingMe](https://via.placeholder.com/1200x600?text=pingMe+Clone+Preview)

🚀 A full-stack real-time chat application built with the **MERN** stack. This project mimics pingMe, enabling users to send messages, share media, and engage in instant conversations using **WebSockets** for real-time updates.

## ✨ Features

✅ **Real-Time Messaging** (Instant chat powered by Socket.io)  
✅ **User Authentication** (JWT-based login & signup)  
✅ **One-on-One Chats & Group Chats**  
✅ **Message Read Receipts & Status Updates**  
✅ **Media Sharing (Images, Videos, Documents)**  
✅ **Typing Indicators & Online Status**  
✅ **Push Notifications**  
✅ **Secure Password Hashing** (Bcrypt)  
✅ **Dark Mode & Responsive UI**  
✅ **Optimized Database Queries for Fast Performance**  

---

## 🛠️ Tech Stack

### Frontend
- React.js (with Hooks & Context API)
- Redux Toolkit (For State Management)
- React Router (For Client-Side Routing)
- TailwindCSS & Material-UI (For UI Styling)
- Axios & React Query (For API Requests & Caching)
- Framer Motion (For Animations)
- React Toastify (For Notifications)
- React Markdown (For Rendering Markdown)
- Socket.io-client (For Real-Time Communication)

### Backend
- Node.js & Express.js (For REST API)
- MongoDB & Mongoose (For Database Management)
- Socket.io (For WebSockets & Real-Time Messaging)
- JWT & Passport.js (For Authentication)
- Multer & Cloudinary (For File Uploads)
- Bcrypt.js (For Password Hashing)
- Express Rate Limit & Helmet (For Security)
- Dotenv (For Environment Variables)

### Deployment & Dev Tools
- **Vercel / Netlify** (For Frontend Hosting)
- **Render / Digital Ocean** (For Backend Hosting)
- **MongoDB Atlas** (For Cloud Database Storage)
- **Postman** (For API Testing)
- **ESLint & Prettier** (For Code Quality)
- **GitHub Actions** (For CI/CD)

---

## 📂 Folder Structure

### Frontend (`/client`)
```
/client
│── public/             # Static assets (index.html, icons, etc.)
│── src/
|   ├── api/     
|   ├── assets/   
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (Login, Chat, Profile)      
│   ├── redux/          # Redux state management
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services (Axios requests)
│   ├── App.jsx          # Main app component
│   ├── main.js        # Root file
│── .env                # Environment variables
│── package.json        # Dependencies & scripts
```

### Backend (`/server`)
```

/server           # Static assets (index.html, icons, etc.)
│── src/
|   ├── config/             # Configuration files (DB, JWT, etc.)
|   ├── controllers/        # Route logic (chat, auth, users)
│   ├── models/            # MongoDB Schemas (User, Message, Chat)
│   ├── routes/            # API endpoints (chatRoutes, authRoutes, etc.)     
│   ├── middleware/        # Authentication & security middleware
│   ├── sockets/          # WebSocket events & handling
│   ├── uploads/         # Temporary file storage
│   ├── server.js         # Server entry point
│── .env                # Environment variables
│── package.json  

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Lokesh-Bijarniya/Team-4_PingMe.git
cd pingMe-clone
```

### 2️⃣ Install Dependencies
#### 📌 Install frontend dependencies
```bash
cd client
npm install
```

#### 📌 Install backend dependencies
```bash
cd server
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in both `client/` and `server/` folders with the following variables:

#### Client (`client/.env`)
```
REACT_APP_API_URL=http://localhost:5173
```

#### Server (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://your-mongodb-url
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
```

### 4️⃣ Start the Development Server
#### Run Backend
```bash
cd server
npm run dev
```

#### Run Frontend
```bash
cd client
npm start
```

---

## 📸 Screenshots

### 🔹 Login & Signup
![Login Screen](https://via.placeholder.com/600x300?text=Login+Screen)

### 🔹 Chat Interface
![Chat Screen](https://via.placeholder.com/600x300?text=Chat+Screen)

### 🔹 Community Chats
![Community Chat](https://via.placeholder.com/600x300?text=Group+Chat)

---

## 🚀 Deployment
### **Frontend Deployment (Vercel/Netlify)**
```bash
npm run build
vercel deploy  # For Vercel
netlify deploy # For Netlify
```

### **Backend Deployment (Render/DigitalOcean)**
```bash
git push origin main
```

---

## 🛠️ APIs & Endpoints
### **Auth Routes** (v1/api/auth)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get user profile (Requires authentication)
- `POST /refresh-token` - Refresh authentication token
- `POST /password-reset-request` - Request password reset link
- `POST /reset-password` - Reset password using token
- `GET /verify-email` - Verify email through verification link
- `POST /resend-verification` - Resend email verification link
- `GET /google` - Google OAuth login
- `GET /google/callback` - Google OAuth callback
- `PUT /update-profile` - Update user profile (Requires authentication)
- `POST /change-password` - Change user password (Requires authentication)
- `DELETE /delete-account` - Delete user account (Requires authentication)
- `POST /logout` - Logout user (Requires authentication)
- `GET /search` - Search users by name or email (Requires authentication)

### **Chat Routes** (v1/api/chats)
- `POST /` - Create or get a direct chat (Requires authentication)
- `GET /` - Get all chats with last message (Requires authentication)
- `GET /:chatId` - Get messages in a chat (Requires authentication)
- `DELETE /:chatId` - Delete a chat (Requires authentication)

### **Chat Routes** (/v1/api/communities)
- `POST /` - Create a new community (Requires authentication)
- `GET /` - Get all joined communities (Requires authentication)
- `GET /:communityId/messages` - Get messages from a community (Requires authentication)
- `POST /:id/join` - Join a community (Requires authentication)
- `POST /:id/leave` - Leave a community (Requires authentication)
- `DELETE /:id` - Delete a community who admin (Requires authentication)

### **Socket Events** 
- `message` - Send and receive messages
- `typing` - Show typing indicator
- `online-status` - Track online users
- `join-chat` - For join the chat room
- `leave-chat` - For leave the chat room
- `upload-file` - For upload the file of chat

---

## 🙌 Contribution Guidelines
1. Fork the repository 🍴
2. Create a new branch (`feature-branch`) 🌱
3. Commit your changes (`git commit -m "New Feature"`) ✅
4. Push to the branch (`git push origin feature-branch`) 🚀
5. Open a Pull Request 🔥

---

## 📄 License
This project is **MIT Licensed**. Feel free to use and modify it!

## 👤 Author  
**[Lokesh Bijarniya](https://github.com/Lokesh-Bijarniya)**

## 🔖 Tags  
`#MERN` `#Socket.io` `#Real-Time Chat` `#React` `#Node.js` `#MongoDB`


💡 Happy Coding! 🚀
