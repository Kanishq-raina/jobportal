import User from '../models/user.js';
import { sendContactUsEmail } from '../utils/sendContactUsEmail.js';


export const sendContactEmail = async (req, res) => {
 const { subject, message } = req.body;


 if (!subject || !message) {
   return res.status(400).json({ message: "Subject and message are required." });
 }


 try {
   const studentUser = await User.findById(req.user.id).select("name email role");
   if (!studentUser || studentUser.role !== "student") {
     return res.status(403).json({ message: "Unauthorized" });
   }


   const adminUser = await User.findOne({ role: "admin" }).select("name email");
   if (!adminUser) {
     return res.status(404).json({ message: "Admin not found." });
   }


   // ✅ Log admin email here
   console.log("📨 Sending to admin:", adminUser.email);


   await sendContactUsEmail({
     fromName: studentUser.name,
     fromEmail: studentUser.email,
     toName: adminUser.name,
     toEmail: adminUser.email,
     subject,
     message,
   });


   res.status(200).json({ message: "Message sent successfully." });
 } catch (err) {
   console.error("Email send error:", err);
   res.status(500).json({ message: "Failed to send message." });
 }
};



