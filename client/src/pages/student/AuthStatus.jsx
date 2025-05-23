import React, { useEffect, useState } from "react";
import StudentSidebar from "../../components/StudentComponents/StudentSidebar";
import StudentTopNav from "../../components/StudentComponents/StudentTopNav";
import { Toaster } from "react-hot-toast";
import StudentAuthStatus from "../../components/StudentComponents/StudentAuthStatus";
import clsx from "clsx";


const AuthStatus = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [requests, setRequests] = useState([]);


 useEffect(() => {
   const fetchRequests = async () => {
     const token = localStorage.getItem("studentToken");
     if (!token) return console.warn("No token found.");


     try {
       const res = await fetch("http://localhost:5000/api/student/authrequests", {
         headers: { Authorization: `Bearer ${token}` },
       });


       const data = await res.json();


       if (res.ok) {
         const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
         const recentRequests = data.filter((req) => {
           const created = new Date(req.createdAt).getTime();
           return created >= threeDaysAgo;
         });
         setRequests(recentRequests);
       } else {
         console.error("Fetch failed:", data);
       }
     } catch (err) {
       console.error("Network error:", err);
     }
   };


   fetchRequests();
 }, []);


 return (
   <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
     <Toaster />
     <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         "flex flex-col flex-1 transition-all duration-300",
         isCollapsed ? "ml-[72px]" : "ml-24"
       )}
     >
       <StudentTopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} isCollapsed={isCollapsed} />
       <main className="mt-[72px] px-6 py-10 text-gray-800 dark:text-white">
         <StudentAuthStatus requests={requests} />
       </main>
     </div>
   </div>
 );
};


export default AuthStatus;





