import React, { useState, useEffect } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import TopNav from "../../components/AdminComponents/TopNav";
import AdminSettingForm from "../../components/AdminComponents/AdminSettingForm";
import { toast, Toaster } from "react-hot-toast";
import clsx from "clsx";


const AdminSettings = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [formData, setFormData] = useState({
   newUsername: "",
   newPassword: "",
 });


 useEffect(() => {
   const info = JSON.parse(localStorage.getItem("adminInfo"));
   if (info) {
     setFormData((prev) => ({
       ...prev,
       newUsername: info.username || "",
     }));
   }
 }, []);


 const handleChange = (e) => {
   setFormData((prev) => ({
     ...prev,
     [e.target.name]: e.target.value,
   }));
 };


 const handleSubmit = async (e) => {
   e.preventDefault();
   const token = localStorage.getItem("adminToken");


   if (!formData.newUsername || !formData.newPassword) {
     return toast.error("Both fields are required");
   }


   if (formData.newPassword.length < 6) {
     return toast.error("Password must be at least 6 characters");
   }


   try {
     const response = await fetch("http://localhost:5000/api/admin/credentials", {
       method: "PATCH",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify(formData),
     });


     const data = await response.json();


     if (!response.ok) {
       toast.error(data.message || "Failed to update credentials");
     } else {
       toast.success("Credentials updated! Logging out...");
       localStorage.removeItem("adminToken");
       localStorage.removeItem("adminInfo");
       setTimeout(() => {
         window.location.href = "/";
       }, 2000);
     }
   } catch (error) {
     console.error("Credential update error:", error);
     toast.error("Something went wrong");
   }
 };


 return (
   <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
     <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         "flex flex-col flex-1 transition-all duration-300",
         isCollapsed ? "ml-20" : "ml-24"
       )}
     >
       <TopNav
         toggleSidebar={() => setIsCollapsed((prev) => !prev)}
         isCollapsed={isCollapsed}
       />
       <Toaster />
      <main className="mt-[72px] px-6 pt-10 pb-6 flex justify-center min-h-[calc(100vh-72px)]">
 <div className="w-full max-w-xl">
   <h1 className="text-4xl font-bold mb-6 text-center">
     Update Login Credentials
   </h1>
   <AdminSettingForm
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


export default AdminSettings;





