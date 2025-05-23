import nodemailer from 'nodemailer';


export const sendContactUsEmail = async ({ fromName, fromEmail, toName, toEmail, subject, message }) => {
 const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: process.env.MAIL_STUDENT_USERNAME,
     pass: process.env.MAIL_STUDENT_PASSWORD,
   },
 });


 await transporter.sendMail({
   from: process.env.MAIL_STUDENT_USERNAME,
   to: toEmail,
   subject,
   html: `
     <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
       <p>Hello Admin,</p>
      
       <p style="margin-top: 12px; line-height: 1.6;">
         ${message}
       </p>
      
       <br/>
       <p>Regards,</p>
       <p><strong>${fromName}</strong><br/><a href="mailto:${fromEmail}" style="color: #1a73e8;">${fromEmail}</a></p>
     </div>
   `,
   replyTo: fromEmail,
 });
 };





