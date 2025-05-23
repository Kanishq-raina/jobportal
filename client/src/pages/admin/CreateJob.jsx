import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminComponents/Sidebar';
import TopNav from '../../components/AdminComponents/TopNav';
import JobForm from '../../components/AdminComponents/JobForm';
import { toast, Toaster } from 'react-hot-toast';
import clsx from 'clsx';


const CreateJob = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [courses, setCourses] = useState([]);


 useEffect(() => {
   const fetchCourses = async () => {
     try {
       const res = await fetch('https://jobportal-xqgm.onrender.com/api/courses');
       const data = await res.json();
       setCourses(data);
     } catch (error) {
       console.error('Failed to fetch courses:', error);
       toast.error('Could not load course data');
     }
   };


   fetchCourses();
 }, []);


 const handleSubmit = async (formData, logo) => {
   const token = localStorage.getItem('adminToken');
   const fd = new FormData();
   fd.append('logo', logo);
   Object.entries(formData).forEach(([key, val]) => {
     fd.append(key, Array.isArray(val) ? JSON.stringify(val) : val);
   });


   try {
     const res = await fetch('https://jobportal-xqgm.onrender.com/api/admin/create-job', {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` },
       body: fd,
     });


     const data = await res.json();
     res.ok
       ? toast.success('Job created successfully!')
       : toast.error(data.message || 'Job creation failed');
   } catch (err) {
     console.error(err);
     toast.error('Server error');
   }
 };


 const handleExcelUpload = async (excelFile) => {
   const token = localStorage.getItem('adminToken');
   const formData = new FormData();
   formData.append('excelFile', excelFile);


   try {
     const res = await fetch('https://jobportal-xqgm.onrender.com/api/admin/upload-jobs-excel', {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` },
       body: formData,
     });
     const data = await res.json();
     res.ok
       ? toast.success(`${data.createdCount} jobs uploaded`)
       : toast.error(data.message || 'Excel upload failed');
   } catch (err) {
     console.error(err);
     toast.error('Excel upload failed');
   }
 };

return (
   <div className="flex h-screen w-full">
     <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         "flex flex-col flex-1 transition-all duration-300",
         isCollapsed ? "ml-20" : "ml-24"
       )}
     >
       <TopNav toggleSidebar={() => setIsCollapsed(p => !p)} isCollapsed={isCollapsed} />
       <Toaster />
       <main className="mt-[72px] px-6 py-10 w-full h-full bg-white dark:bg-gray-900 rounded-3xl  overflow-auto">
         <div className="max-w-5xl mx-auto text-gray-800 dark:text-white">
           <JobForm onSubmit={handleSubmit} onExcelUpload={handleExcelUpload} courses={courses} />
         </div>
       </main>
     </div>
   </div>
 );




};


export default CreateJob;





