// src/redux/rootReducer.js
import { combineReducers } from 'redux';
import authReducer from './features/auth/authSlice';
import chatReducer from './features/chat/chatSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
});

export default rootReducer;
