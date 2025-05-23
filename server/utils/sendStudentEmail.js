import nodemailer from 'nodemailer';

export const sendStudentEmail = async (email, link) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Job Portal" <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: 'Welcome to the Job Portal - Set Up Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2c3e50;">Welcome to the Job Portal!</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            We're excited to have you on board. Your account has been successfully created in our system.
            To get started, please set up your username and password to access your personalized job portal dashboard.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Click the button below to complete your account setup. This will allow you to explore job opportunities,
            update your profile, and apply with ease.
          </p>
          <a href="${link}" target="_blank" style="display: inline-block; padding: 12px 24px; margin: 16px 0; background-color: #1d72b8; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;">
            Set Up Your Account
          </a>
          <p style="font-size: 14px; color: #777;">
            Please note: This link is valid for 24 hours. If it expires, you can request a new one from the portal login page.
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            If you did not expect this email, please ignore it. No action is required.
          </p>
          <p style="font-size: 14px; color: #999;">
            Regards,<br/>
            <strong>Job Portal Team</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Mail sent to ${email}`);
  } catch (err) {
    console.error('❌ Email error:', err);
    throw err;
  }
};
