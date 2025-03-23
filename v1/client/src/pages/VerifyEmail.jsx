import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authSuccess, authFailure, verifyEmail } from "../redux/features/auth/authSlice";
import { CircularProgress, Box, Typography, Container, Alert } from "@mui/material";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyUserEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid or expired verification link.");
        return;
      }

      try {
        const response = await dispatch(verifyEmail(token));
        sessionStorage.setItem("user", JSON.stringify(response.user));
        sessionStorage.setItem("authToken", response.token);

        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");

        dispatch(authSuccess({ 
          user: response.user, 
          token: response.token, 
          rememberMe: false 
        }));
        setTimeout(() => navigate("/"), 2000); // Redirect after 2s
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Email verification failed.");
        dispatch(authFailure(error.message || "Email verification failed"));
        setTimeout(() => navigate("/auth"), 3000); // Redirect after 3s
      }
    };
``
    verifyUserEmail();
  }, [navigate, dispatch]);

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
      >
        {status === "loading" && (
          <>
            <CircularProgress size={50} color="primary" />
            <Typography variant="h6" mt={2}>
              Verifying your email...
            </Typography>
          </>
        )}

        {status === "success" && (
          <Alert severity="success" variant="filled">
            {message}
          </Alert>
        )}

        {status === "error" && (
          <Alert severity="error" variant="filled">
            {message}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail;
