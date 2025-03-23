import { gmail } from "../config/googleGmailAuth.js";

export const sendVerificationEmail = async (email, verificationLink) => {
  try {
    if (!email) {
      throw new Error("Recipient email is missing or invalid.");
    }

    console.log("📩 Sending verification email to:", email);

    const emailContent = [
      `From: "PingMe Support" <${process.env.GOOGLE_EMAIL}>`,
      `To: ${email}`,
      `Subject: Confirm Your Email - PingMe`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      ``,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">`,
      `  <h2 style="color: #007bff; text-align: center;">Welcome to PingMe! 🎉</h2>`,
      `  <p>Hello,</p>`,
      `  <p>Thank you for signing up for PingMe! Before you can start using your account, please confirm your email address by clicking the button below:</p>`,
      `  <p style="text-align: center;">`,
      `    <a href="${verificationLink}"  style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>`,
      `  </p>`,
      `  <p>If you didn’t create this account, you can ignore this email. This link will expire in <strong>24 hours</strong>.</p>`,
      `  <p>Need help? Contact our support team at <a href="mailto:support@pingme.com">support@pingme.com</a>.</p>`,
      `  <p style="text-align: center; font-size: 14px; color: #666;">Happy chatting, <br> The PingMe Team 💙</p>`,
      `</div>`,
    ].join("\r\n");

    const encodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedEmail },
    });

    console.log("✅ Verification email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.message);
    throw error;
  }
};




export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    if (!email) {
      throw new Error("Recipient email is missing or invalid.");
    }

    console.log("📩 Sending password reset email to:", email);

    const emailContent = [
      `From: "PingMe Support" <${process.env.GOOGLE_EMAIL}>`,
      `To: ${email}`,
      `Subject: Password Reset Request - PingMe`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      ``,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">`,
      `  <h2 style="color: #ff5733; text-align: center;">Reset Your Password 🔐</h2>`,
      `  <p>Hello,</p>`,
      `  <p>We received a request to reset your password for your PingMe account. Click the button below to reset your password:</p>`,
      `  <p style="text-align: center;">`,
      `    <a href="${resetLink}" style="background-color: #ff5733; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>`,
      `  </p>`,
      `  <p>This link is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.</p>`,
      `  <p>If you have any issues, contact us at <a href="mailto:support@pingme.com">support@pingme.com</a>.</p>`,
      `  <p style="text-align: center; font-size: 14px; color: #666;">Stay secure, <br> The PingMe Team 💙</p>`,
      `</div>`,
    ].join("\r\n");

    const encodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedEmail },
    });

    console.log("✅ Password reset email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error.message);
    throw error;
  }
};
