import nodemailer from 'nodemailer';


export const sendEmailUpdateConfirmation = async (toEmail, username = '') => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });


  const mailOptions = {
    from: `"Job Portal Team" <${process.env.MAIL_USERNAME}>`,
    to: toEmail,
    subject: '✅ Email Updated Successfully',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Email Update Confirmation</h2>
        <p>Dear ${username || 'User'},</p>
        <p>Your email has been successfully updated in the admin portal.</p>
        <p>If this wasn't you, please contact our support team immediately.</p>
        <br />
        <p>Regards,<br/>Job Portal Support</p>
      </div>
    `,
  };


  await transporter.sendMail(mailOptions);
};




