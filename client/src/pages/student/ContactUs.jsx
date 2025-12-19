import React, { useState } from "react";
import StudentSidebar from "../../components/StudentComponents/StudentSidebar";
import StudentTopNav from "../../components/StudentComponents/StudentTopNav";
import clsx from "clsx";


const ContactUs = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [formData, setFormData] = useState({ subject: "", message: "" });


 const handleChange = (e) => {
   setFormData({ ...formData, [e.target.name]: e.target.value });
 };


 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     const res = await fetch("https://jobportal-xqgm.onrender.com/api/contact/send", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
       },
       body: JSON.stringify({
         subject: formData.subject,
         message: formData.message,
       }),
     });


     const data = await res.json();
     if (!res.ok) throw new Error(data.message);
     alert("Message sent successfully.");
     setFormData({ subject: "", message: "" });
   } catch (err) {
     alert("Failed to send message.");
     console.error(err);
   }
 };


 return (
   <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
     <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         "flex flex-col flex-1 transition-all duration-300",
         isCollapsed ? "ml-[72px]" : "ml-24"
       )}
     >
       <StudentTopNav
         toggleSidebar={() => setIsCollapsed((prev) => !prev)}
         isCollapsed={isCollapsed}
       />


       <main className="mt-[72px] px-6 py-10 text-gray-800 dark:text-white flex justify-center">
         <form
           onSubmit={handleSubmit}
           className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-xl w-full max-w-md space-y-4"
         >
           <h1 className="text-2xl font-bold text-center mb-4">Contact Admin</h1>


           <input
             type="text"
             name="subject"
             value={formData.subject}
             onChange={handleChange}
             required
             placeholder="Subject"
             className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
           />


           <textarea
             name="message"
             value={formData.message}
             onChange={handleChange}
             required
             placeholder="Your Message"
             rows={6}
             className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
           ></textarea>


           <button
             type="submit"
             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-full"
           >
             Send Mail
           </button>
         </form>
       </main>
     </div>
   </div>
 );
};


export default ContactUs;





