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
- TailwindCSS (For Modern UI)
- Axios (For API Requests)
- Socket.io-client (For Real-Time Communication)

### Backend
- Node.js & Express.js (For REST API)
- MongoDB & Mongoose (For Database Management)
- Socket.io (For WebSockets & Real-Time Messaging)
- JSON Web Tokens (JWT) (For Secure Authentication)
- Multer (For File Uploads)
- Bcrypt.js (For Password Hashing)
- Cloudinary (For Image & Video Storage)

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
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (Login, Chat, Profile)
│   ├── context/        # Context API for state management
│   ├── redux/          # Redux state management
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services (Axios requests)
│   ├── utils/          # Helper functions
│   ├── App.js          # Main app component
│   ├── index.js        # Root file
│── .env                # Environment variables
│── package.json        # Dependencies & scripts
```

### Backend (`/server`)
```
/server
│── config/             # Configuration files (DB, JWT, etc.)
│── controllers/        # Route logic (chat, auth, users)
│── models/            # MongoDB Schemas (User, Message, Chat)
│── routes/            # API endpoints (chatRoutes, authRoutes, etc.)
│── middleware/        # Authentication & security middleware
│── sockets/          # WebSocket events & handling
│── uploads/         # Temporary file storage
│── index.js         # Server entry point
│── .env             # Environment variables
│── package.json     # Dependencies & scripts
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/pingMe-clone.git
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
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
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

### 🔹 Group Chats
![Group Chat](https://via.placeholder.com/600x300?text=Group+Chat)

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
### **Auth Routes**
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get user profile

### **Chat Routes**
- `POST /api/chats/create` - Create a chat
- `GET /api/chats/:id` - Get chat messages
- `POST /api/messages/send` - Send a message

### **Socket Events**
- `message` - Send and receive messages
- `typing` - Show typing indicator
- `online-status` - Track online users

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

💡 Happy Coding! 🚀
# Team-4_PingMe
