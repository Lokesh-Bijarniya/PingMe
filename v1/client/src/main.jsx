import React from "react";
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* <StrictMode> */}
      <Router>
        <App />
      </Router>
    {/* </StrictMode> */}
  </Provider>
);
