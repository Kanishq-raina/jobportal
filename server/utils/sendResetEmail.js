// server/utils/sendResetEmail.js
import nodemailer from "nodemailer";


export const sendResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,      // your Gmail
      pass: process.env.MAIL_PASSWORD,      // app password
    },
  });


  const mailOptions = {
    from: `"Job Portal Support" <${process.env.MAIL_USERNAME}>`,
    to,
    subject: "🔐 Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to continue:</p>
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 12px 20px;
          margin-top: 10px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };


  await transporter.sendMail(mailOptions);
};





