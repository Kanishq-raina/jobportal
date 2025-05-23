import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
 FiHome,
 FiBriefcase,
 FiPhone,
 FiFileText,
 FiClipboard,
 FiSettings,
} from 'react-icons/fi';
import clsx from 'clsx';


const StudentSidebar = () => {
 const location = useLocation();
 const [isCollapsed, setIsCollapsed] = useState(true);


 const navSections = [
   {
     title: 'Main',
     links: [{ name: 'Dashboard', path: '/student/dashboard', icon: <FiHome /> }],
   },
   {
     title: 'Navigation',
     links: [
       { name: 'Company', path: '/student/company', icon: <FiBriefcase /> },
       { name: 'Contact Us', path: '/student/contact', icon: <FiPhone /> },
       { name: 'Resume Generate', path: '/student/resume', icon: <FiFileText /> },
       { name: 'Auth Status', path: '/student/authstatus', icon: <FiClipboard /> },
     ],
   },
   {
     title: 'Settings',
     links: [{ name: 'Settings', path: '/student/settings', icon: <FiSettings /> }],
   },
 ];


 const isActive = (path) => location.pathname === path;


 const renderLink = (link) => (
   <div key={link.name} className="relative group">
     <Link
       to={link.path}
       className={clsx(
         'flex transition-all duration-500 font-semibold rounded-xl hover:scale-[1.06]',
         isCollapsed
           ? 'justify-center items-center w-[48px] h-[48px] mx-auto'
           : 'items-center justify-start px-4 py-3 w-full gap-3',
         isActive(link.path)
           ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md'
           : 'text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-500'
       )}
     >
       <span className="text-[18px]">{link.icon}</span>
       <span
         className={clsx(
           'text-[15px] whitespace-nowrap transition-all duration-500 ease-in-out',
           isCollapsed
             ? 'opacity-0 -translate-x-3 w-0 overflow-hidden'
             : 'opacity-100 translate-x-0'
         )}
       >
         {link.name}
       </span>
     </Link>


     {isCollapsed && (
       <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition duration-300 bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
         {link.name}
       </div>
     )}
   </div>
 );


 return (
   <aside
     onMouseEnter={() => setIsCollapsed(false)}
     onMouseLeave={() => setIsCollapsed(true)}
     className={clsx(
       'fixed top-0 left-0 h-screen z-[70] flex flex-col transition-all duration-500 ease-in-out backdrop-blur-sm hover:backdrop-blur-2xl',
       isCollapsed
         ? 'w-[72px] bg-transparent border-none shadow-none'
         : 'w-64 bg-black/10 backdrop-saturate-200 hover:backdrop-blur-2xl border-r border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'
     )}
   >
     <div className="flex flex-col h-full justify-between">
       <div className={clsx('pt-[80px] flex flex-col gap-6 transition-all duration-500', isCollapsed ? '' : 'px-4')}>
         {navSections.slice(0, 2).map((section) => (
           <div key={section.title} className="flex flex-col gap-2">
             {!isCollapsed && (
               <div className="text-xs uppercase font-bold text-gray-400 tracking-wide px-1">
                 {section.title}
               </div>
             )}
             {section.links.map((link) => renderLink(link))}
           </div>
         ))}
       </div>


       {/* Settings Section */}
       <div className={clsx('pb-6 transition-all duration-500 flex flex-col gap-2', isCollapsed ? '' : 'px-4')}>
         {!isCollapsed && (
           <div className="text-xs uppercase font-bold text-gray-400 tracking-wide px-1">
             {navSections[2].title}
           </div>
         )}
         {navSections[2].links.map((link) => renderLink(link))}
       </div>
     </div>
   </aside>
 );
};


export default StudentSidebar;





