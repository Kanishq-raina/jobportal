import nodemailer from 'nodemailer';
export const sendCustomMail = async (recipients, subject, body) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  
    const validRecipients = recipients.filter(email => typeof email === 'string' && email.includes('@'));
  
    if (!validRecipients.length) {
      throw new Error("No valid recipients to send email to");
    }
  
    const results = await Promise.all(
      validRecipients.map((email) =>
        transporter.sendMail({
          from: `"Job Portal" <${process.env.MAIL_USERNAME}>`,
          to: email,
          subject,
          html: `<p>${body}</p>`,
        })
      )
    );
  
    return results.length;
  };
  