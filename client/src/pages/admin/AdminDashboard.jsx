import React, { useState } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import TopNav from "../../components/AdminComponents/TopNav";
import {
 PieChart,
 Pie,
 Cell,
 Tooltip,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 ResponsiveContainer,
} from "recharts";
import clsx from "clsx";


const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];


const AdminDashboard = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);


 const stats = {
   totalJobs: 120,
   activeJobs: 85,
   students: 400,
   applications: 950,
 };


 const jobsStatus = [
   { name: "Active", value: 85 },
   { name: "Taken", value: 20 },
   { name: "Inactive", value: 15 },
 ];


 const applicationsMonthly = [
   { month: "Jan", applications: 80 },
   { month: "Feb", applications: 95 },
   { month: "Mar", applications: 120 },
   { month: "Apr", applications: 100 },
 ];


 const toggleSidebar = () => {
   setIsCollapsed((prev) => !prev);
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




       <TopNav toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />


       {/* Content below TopNav */}
       <main className="mt-[72px] px-6 py-4">


         <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
           Admin Dashboard
         </h2>


         {/* Stat Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
           {[
             { label: "Total Jobs", value: stats.totalJobs, color: "text-green-500" },
             { label: "Active Jobs", value: stats.activeJobs, color: "text-blue-500" },
             { label: "Students", value: stats.students, color: "text-yellow-500" },
             { label: "Applications", value: stats.applications, color: "text-red-500" },
           ].map((item, index) => (
             <div
               key={index}
               className="p-6 bg-white rounded-2xl shadow-xl hover:scale-[1.03] transform transition-all duration-300"
             >
               <h3 className="text-lg font-semibold text-gray-600">{item.label}</h3>
               <p className={`text-4xl font-extrabold mt-4 ${item.color}`}>{item.value}</p>
             </div>
           ))}
         </div>


         {/* Graphs Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
             <h3 className="text-xl font-bold text-gray-700 mb-6">Job Status Distribution</h3>
             <ResponsiveContainer width="100%" height={300}>
               <PieChart>
                 <Pie
                   data={jobsStatus}
                   dataKey="value"
                   nameKey="name"
                   cx="50%"
                   cy="50%"
                   outerRadius={100}
                   label
                 >
                   {jobsStatus.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>


           <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
             <h3 className="text-xl font-bold text-gray-700 mb-6">Applications Per Month</h3>
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={applicationsMonthly}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="month" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" />
                 <Tooltip />
                 <Bar
                   dataKey="applications"
                   fill="#3b82f6"
                   radius={[10, 10, 0, 0]}
                   isAnimationActive
                 />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
       </main>
     </div>
   </div>
 );
};


export default AdminDashboard;





