import React, { useEffect, useState } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import TopNav from "../../components/AdminComponents/TopNav";
import { Toaster, toast } from "react-hot-toast";
import AuthRequestTable from "../../components/AdminComponents/AuthRequestTable";
import clsx from "clsx";


const AuthRequest = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [requests, setRequests] = useState([]);
 const [loading, setLoading] = useState(false);
 const token = localStorage.getItem("adminToken");


 const fetchRequests = async () => {
   try {
     setLoading(true);
     const res = await fetch("https://jobportal-xqgm.onrender.com/api/admin/authrequests", {
       headers: { Authorization: `Bearer ${token}` },
     });
     const data = await res.json();
     if (res.ok) {
       setRequests(data);
     } else toast.error(data.message || "Failed to load requests");
   } catch {
     toast.error("Failed to load requests");
   } finally {
     setLoading(false);
   }
 };


 useEffect(() => {
   fetchRequests();
 }, []);


 const handleApprove = async (id) => {
   try {
     const res = await fetch(
       `https://jobportal-xqgm.onrender.com/api/admin/authrequests/${id}/approve`,
       {
         method: "PATCH",
         headers: { Authorization: `Bearer ${token}` },
       }
     );
     if (res.ok) {
       toast.success("Approved request");
       fetchRequests();
     } else {
       toast.error("Approval failed");
     }
   } catch {
     toast.error("Approval failed");
   }
 };


 const handleReject = async (id, feedback = "Rejected by admin") => {
   try {
     const res = await fetch(
       `https://jobportal-xqgm.onrender.com/api/admin/authrequests/${id}/reject`,
       {
         method: "PATCH",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({ feedback }),
       }
     );
     if (res.ok) {
       toast.success("Rejected request");
       fetchRequests();
     } else {
       toast.error("Rejection failed");
     }
   } catch {
     toast.error("Rejection failed");
   }
 };


 const handleDelete = async (id) => {
   try {
     const res = await fetch(
       `https://jobportal-xqgm.onrender.com/api/admin/authrequests/${id}`,
       {
         method: "DELETE",
         headers: { Authorization: `Bearer ${token}` },
       }
     );
     if (res.ok) {
       toast.success("Deleted request");
       fetchRequests();
     } else {
       toast.error("Delete failed");
     }
   } catch {
     toast.error("Delete failed");
   }
 };


 const handleApproveSelected = async (ids) => {
   for (let id of ids) await handleApprove(id);
 };


 const handleRejectSelected = async (ids, feedback) => {
   for (let id of ids) await handleReject(id, feedback);
 };


 const handleDeleteSelected = async (ids) => {
   for (let id of ids) await handleDelete(id);
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
       <TopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} isCollapsed={isCollapsed} />
       <Toaster />
       <main className="mt-[72px] px-6 py-10">
         <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
           Authorization Requests
         </h1>


         {loading ? (
           <div className="text-gray-600 dark:text-gray-200">Loading...</div>
         ) : (
           <AuthRequestTable
             requests={requests}
             onApprove={handleApprove}
             onReject={handleReject}
             onDelete={handleDelete}
             onApproveSelected={handleApproveSelected}
             onRejectSelected={handleRejectSelected}
             onDeleteSelected={handleDeleteSelected}
           />
         )}
       </main>
     </div>
   </div>
 );
};


export default AuthRequest;





