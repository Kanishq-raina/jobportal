import React, { useEffect, useRef, useState } from "react";
import { FiLogOut, FiUser, FiMoon, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import clsx from "clsx";


import studentAvatar from "../../assets/admin-avatar.json";
import _sidebarMascot from "../../assets/sidebar-mascot.json";


const StudentTopNav = ({ toggleSidebar }) => {
 const [theme, setTheme] = useState("light");
 const [dropdownOpen, setDropdownOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const [studentData, setStudentData] = useState({ username: "Student", role: "student" });
 const navigate = useNavigate();
 const dropdownRef = useRef();


 useEffect(() => {
   const info = JSON.parse(localStorage.getItem("studentInfo"));
   if (info) setStudentData(info);


   const savedTheme = localStorage.getItem("theme");
   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
   const initialTheme = savedTheme || (prefersDark ? "dark" : "light");


   setTheme(initialTheme);
   document.documentElement.classList.toggle("dark", initialTheme === "dark");


   const handleScroll = () => setScrolled(window.scrollY > 10);
   window.addEventListener("scroll", handleScroll);
   return () => window.removeEventListener("scroll", handleScroll);
 }, []);


 const _toggleTheme = () => {
   const newTheme = theme === "dark" ? "light" : "dark";
   setTheme(newTheme);
   localStorage.setItem("theme", newTheme);
   document.documentElement.classList.toggle("dark", newTheme === "dark");
 };


 const handleLogout = () => {
   localStorage.removeItem("studentInfo");
   navigate("/");
 };


 let closeTimeout;
 const handleEnter = () => {
   clearTimeout(closeTimeout);
   setDropdownOpen(true);
 };
 const handleLeave = () => {
   closeTimeout = setTimeout(() => setDropdownOpen(false), 200);
 };


 return (
   <header
     className={clsx(
       "fixed top-0 left-0 right-0 z-[60] px-6 py-3 flex items-center justify-between transition-all duration-500",
       scrolled
         ? "bg-transparent backdrop-blur-2xl hover:backdrop-blur-3xl border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
         : "bg-transparent"
     )}
   >
     {/* Sidebar Toggle */}
     <div
       onClick={toggleSidebar}
       className="cursor-pointer w-10 h-10 hover:scale-110 transition-transform duration-300"
     >
      
     </div>


     {/* Title */}
     <div className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500">
       Student Portal
     </div>


     {/* Right Section */}
     <div className="flex items-center gap-6 relative">
     


       {/* Profile Dropdown */}
       <div
         ref={dropdownRef}
         onMouseEnter={handleEnter}
         onMouseLeave={handleLeave}
         className="relative group"
       >
         {/* Profile Button */}
         <div
           onClick={() => setDropdownOpen((prev) => !prev)}
           className={clsx(
             "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-2xl transition-all duration-300",
             "bg-black/10 text-black border border-white/10 backdrop-blur-xl",
             "hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-500",
             "hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] hover:text-white"
           )}
         >
           <Lottie animationData={studentAvatar} className="h-10 w-10" loop />
           <span className="font-semibold text-[15px] whitespace-nowrap">{studentData.username}</span>
         </div>


         {/* Dropdown Menu */}
         {dropdownOpen && (
           <div
             className={clsx(
               "absolute right-0 mt-2 w-52 rounded-2xl p-3 z-50 space-y-2 animate-fade-in",
               "bg-white/10 dark:bg-gray-800/45 backdrop-blur-xl border border-white/10",
               "shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
             )}
           >
             {/* My Profile */}
             <button
               onClick={() => navigate("/student/profile")}
               className={clsx(
                 "flex items-center w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300",
                 "text-black bg-white/50",
                 "hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-500",
                 "hover:text-white hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] hover:scale-[1.05]"
               )}
             >
               <FiUser className="mr-2 text-lg" />
               My Profile
             </button>


             {/* Logout */}
             <button
               onClick={handleLogout}
               className={clsx(
                 "flex items-center w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300",
                 "text-red-500 bg-white/30",
                 "hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600",
                 "hover:text-white hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] hover:scale-[1.05]"
               )}
             >
               <FiLogOut className="mr-2 text-lg" />
               Logout
             </button>
           </div>
         )}
       </div>
     </div>
   </header>
 );
};


export default StudentTopNav;





