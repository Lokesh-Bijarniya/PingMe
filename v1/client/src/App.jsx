import React from "react";
import Sidebar from "./components/Sidebar";
// import Navbar from "./components/Navbar";
import ChatList from "./components/Chat/ChatList";
import ChatWindow from "./components/Chat/ChatWindow";

const App = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <div className="flex flex-1">
          <ChatList />
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default App;
