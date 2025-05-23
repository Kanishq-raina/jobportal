import nodemailer from 'nodemailer';


export const sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });


  const mailOptions = {
    from: `"Admin Verification" <${process.env.MAIL_USERNAME}>`,
    to,
    subject: 'Verify Your New Admin Email',
    html: `<div>
      <p>Your OTP to verify your email is:</p>
      <h2>${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
    </div>`,
  };


  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", result.response); // ✅ log result
  } catch (error) {
    console.error("❌ Email send failed:", error); // ✅ catch and show error
    throw error; // re-throw so it returns 500
  }
};




