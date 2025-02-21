// src/redux/rootReducer.js
import { combineReducers } from 'redux';
import authReducer from './features/auth/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

export default rootReducer;
