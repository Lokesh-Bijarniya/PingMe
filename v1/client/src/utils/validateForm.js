// utils/validateForm.js

// Validate email (used for login or registration)
export const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };
  
  // Validate password strength (used for login or registration)
  export const validatePassword = (password) => {
    // Password should have at least 8 characters, 1 uppercase, 1 number, and 1 special character
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };
  
  // Validate username (used for signup, to avoid empty or short username)
  export const validateUsername = (username) => {
    return username.trim().length >= 3;  // Username should be at least 3 characters long
  };
  
  // Validate message content (used when sending a new message)
  export const validateMessage = (message) => {
    return message.trim().length > 0;  // Ensure message is not empty
  };
  
  // Combine all validations in one function for signup form
  export const validateSignupForm = (formData) => {
    const errors = {};
  
    if (!validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }
  
    if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters long, include 1 uppercase, 1 number, and 1 special character';
    }
  
    if (!validateUsername(formData.username)) {
      errors.username = 'Username must be at least 3 characters long';
    }
  
    return errors;
  };
  
  // Combine all validations in one function for login form
  export const validateLoginForm = (formData) => {
    const errors = {};
  
    if (!validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }
  
    if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters long, include 1 uppercase, 1 number, and 1 special character';
    }
  
    return errors;
  };
  
  // Combine all validations in one function for message form
  export const validateMessageForm = (message) => {
    const errors = {};
  
    if (!validateMessage(message)) {
      errors.message = 'Message cannot be empty';
    }
  
    return errors;
  };
  