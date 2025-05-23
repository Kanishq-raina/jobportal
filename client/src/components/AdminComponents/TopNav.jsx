import React, { useEffect, useState, useRef } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import clsx from "clsx";
import adminAvatar from "../../assets/admin-avatar.json";


const TopNav = () => {
 const [dropdownOpen, setDropdownOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const [_adminData] = useState({ username: "Admin", role: "admin" });
 const navigate = useNavigate();
 const dropdownRef = useRef();


 useEffect(() => {
   const handleScroll = () => setScrolled(window.scrollY > 10);
   window.addEventListener("scroll", handleScroll);
   return () => window.removeEventListener("scroll", handleScroll);
 }, []);


 const handleLogout = () => {
   localStorage.removeItem("adminInfo");
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
     <div />


     {/* Title */}
     <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
       Administrator
     </div>


     {/* Profile Section */}
     <div className="flex items-center gap-6 relative">
       <div
         ref={dropdownRef}
         onMouseEnter={handleEnter}
         onMouseLeave={handleLeave}
         className="relative group"
       >
         {/* Admin Button Styled Like Sidebar */}
         <div
           onClick={() => setDropdownOpen((prev) => !prev)}
           className={clsx(
             "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-2xl transition-all duration-300",
             "bg-black/10 text-black border border-white/10 backdrop-blur-xl",
             "hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-500",
             "hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] hover:text-white"
           )}
         >
           <Lottie animationData={adminAvatar} className="h-10 w-10" loop />
           <span className="font-semibold text-[15px] whitespace-nowrap">Admin</span>
         </div>


         {/* Dropdown */}
         {dropdownOpen && (
           <div
             className={clsx(
               "absolute right-0 mt-2 w-52 rounded-2xl p-3 z-50 space-y-2 animate-fade-in",
               "bg-white/10 dark:bg-gray-800/45 backdrop-blur-xl border border-white/10",
               "shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
             )}
           >
             {/* My Profile Button */}
             <button
               onClick={() => navigate("/admin/profile")}
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


             {/* Logout Button */}
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


export default TopNav;





