// src/redux/rootReducer.js
import { combineReducers } from 'redux';
import authReducer from './features/auth/authSlice';
import chatReducer from './features/chat/chatSlice';
import callReducer from "./features/call/callSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  call : callReducer
});

export default rootReducer;
