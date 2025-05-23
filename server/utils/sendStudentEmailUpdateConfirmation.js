import nodemailer from 'nodemailer';


export const sendConfirmation = async (toEmail, name = '') => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });


  const mailOptions = {
    from: `"Student Portal" <${process.env.MAIL_USERNAME}>`,
    to: toEmail,
    subject: '✅ Email Updated Successfully',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${name || 'Student'},</h2>
        <p>This is a confirmation that your email has been <strong>successfully updated</strong> in our student portal.</p>
        <p>If you did not request this change, please contact support immediately.</p>
        <br />
        <p>Best regards,<br/>Student Portal Team</p>
      </div>
    `,
  };


  await transporter.sendMail(mailOptions);
};




