import React, { useState } from "react";
import StudentSidebar from "../../components/StudentComponents/StudentSidebar";
import StudentTopNav from "../../components/StudentComponents/StudentTopNav";
import StudentSettingForm from "../../components/StudentComponents/StudentSettingForm";
import { toast, Toaster } from "react-hot-toast";
import clsx from "clsx";


const StudentSettings = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [formData, setFormData] = useState({
   newUsername: "",
   newPassword: "",
 });


 const handleChange = (e) => {
   setFormData((prev) => ({
     ...prev,
     [e.target.name]: e.target.value,
   }));
 };


 const handleSubmit = async (e) => {
   e.preventDefault();
   const token = localStorage.getItem("studentToken");


   if (!formData.newUsername || !formData.newPassword) {
     return toast.error("Both fields are required");
   }


   if (formData.newPassword.length < 6) {
     return toast.error("Password must be at least 6 characters");
   }


   try {
     const credRes = await fetch("http://localhost:5000/api/student/credentials", {
       method: "PATCH",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify(formData),
     });


     const credData = await credRes.json();


     if (!credRes.ok) {
       toast.error(credData.message || "Failed to update credentials");
     } else {
       toast.success("Credentials updated! Logging out...");
       localStorage.removeItem("studentToken");
       localStorage.removeItem("studentInfo");
       setTimeout(() => {
         window.location.href = "/";
       }, 2000);
     }
   } catch (err) {
     console.error("Update credentials error:", err);
     toast.error("Something went wrong");
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
       <Toaster />


       <main className="mt-[72px] px-6 pt-10 pb-6 text-gray-800 dark:text-white flex justify-center">
         <div className="w-full max-w-xl">
           <h1 className="text-4xl font-bold mb-6 text-center">
             Update Login Credentials
           </h1>


           <StudentSettingForm
             formData={formData}
             onChange={handleChange}
             onSubmit={handleSubmit}
           />
         </div>
       </main>
     </div>
   </div>
 );
};


export default StudentSettings;





