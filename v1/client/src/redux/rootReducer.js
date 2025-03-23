// src/redux/rootReducer.js
import { combineReducers } from 'redux';
import authReducer from './features/auth/authSlice';
import chatReducer from './features/chat/chatSlice';
import dashboardReducer from './features/dashboard/dashboardSlice';
import communityReducer from './features/chat/communitySlice';

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  dashboard: dashboardReducer,
  community : communityReducer,
});

export default rootReducer;
