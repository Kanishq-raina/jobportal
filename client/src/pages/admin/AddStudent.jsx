import React, { useEffect, useState } from 'react';
import TopNav from '../../components/AdminComponents/TopNav';
import Sidebar from '../../components/AdminComponents/Sidebar';
import StudentForm from '../../components/AdminComponents/StudentForm';
import { Toaster, toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import clsx from 'clsx';


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const AddStudent = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [courses, setCourses] = useState([]);
 const [availableBranches, setAvailableBranches] = useState([]);
 const [selectedCourse, setSelectedCourse] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [failedStudents, setFailedStudents] = useState([]);


 const fetchCourses = async () => {
   try {
     const res = await fetch(`${API_BASE}/api/courses`);
     const data = await res.json();
     setCourses(data);
   } catch {
     toast.error("Failed to load courses");
   }
 };


 useEffect(() => {
   fetchCourses();
 }, []);


 useEffect(() => {
   const selected = courses.find(c => c.name === selectedCourse);
   setAvailableBranches(selected?.branches || []);
 }, [selectedCourse]);


const handleManualSubmit = async (data, reset) => {
  const capitalizeFullName = (str) =>
    str?.trim().split(/\s+/).map(
      word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");


  try {
    setIsSubmitting(true);


    // ✅ Capitalize names before sending
    const sanitizedData = {
      ...data,
      firstName: capitalizeFullName(data.firstName),
      lastName: capitalizeFullName(data.lastName),
    };


    const token = localStorage.getItem('adminToken');


    const res = await fetch(`${API_BASE}/api/admin/add-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(sanitizedData),
    });


    const result = await res.json();
    if (res.ok) {
      toast.success("Student added successfully");
      reset();
    } else {
      toast.error(result.message || "Failed to add student");
    }
  } catch {
    toast.error("Server error");
  } finally {
    setIsSubmitting(false);
  }
};




const handleFileUpload = async (file) => {
 if (!file) return;




 const normalize = (str) =>
   str?.toLowerCase().replace(/\s+/g, '').replace(/\./g, '').trim();




 const capitalizeFullName = (str) =>
   str?.trim().split(/\s+/).map(
     word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
   ).join(" ");




 const isDecimalValid = (num) => /^\d+(\.\d{1,2})?$/.test(num);




 const reader = new FileReader();




 reader.onload = async (evt) => {
   const data = new Uint8Array(evt.target.result);
   const workbook = XLSX.read(data, { type: 'array' });
   const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);




   const failed = [];




   const students = rows.map(row => {
     const rawCourse = row.course?.trim() || '';
     const rawBranch = row.branch?.trim() || '';
     const rawFirstName = row.firstName?.trim() || '';
     const rawLastName = row.lastName?.trim() || '';




     const matchedCourse = courses.find(
       c => normalize(c.name) === normalize(rawCourse)
     );




     const matchedBranch = matchedCourse?.branches.find(
       b => normalize(b) === normalize(rawBranch)
     );




     // Validations
     if (!rawFirstName || !/^[A-Za-z\s]+$/.test(rawFirstName)) {
       failed.push({ email: row.email || 'N/A', reason: 'Invalid first name' }); return null;
     }
     if (!rawLastName || !/^[A-Za-z\s]+$/.test(rawLastName)) {
       failed.push({ email: row.email || 'N/A', reason: 'Invalid last name' }); return null;
     }
     if (!row.email?.endsWith('@gmail.com')) {
       failed.push({ email: row.email || 'N/A', reason: 'Invalid email' }); return null;
     }
     if (isNaN(row.cgpa) || row.cgpa < 0 || row.cgpa > 10) {
       failed.push({ email: row.email, reason: 'Invalid CGPA' }); return null;
     }
     if (!matchedCourse || !matchedBranch) {
       failed.push({ email: row.email, reason: 'Course or Branch not found in database' }); return null;
     }
     if (isNaN(row.semester) || row.semester < 1 || row.semester > 8) {
       failed.push({ email: row.email, reason: 'Invalid semester' }); return null;
     }
     if (isNaN(row.tenthPercent) || row.tenthPercent < 30 || row.tenthPercent > 100 || !isDecimalValid(row.tenthPercent)) {
       failed.push({ email: row.email, reason: 'Invalid 10th %' }); return null;
     }
     if (isNaN(row.twelfthPercent) || row.twelfthPercent < 30 || row.twelfthPercent > 100 || !isDecimalValid(row.twelfthPercent)) {
       failed.push({ email: row.email, reason: 'Invalid 12th %' }); return null;
     }




     return {
       ...row,
       firstName: capitalizeFullName(rawFirstName),
       lastName: capitalizeFullName(rawLastName),
       course: matchedCourse.name,
       branch: matchedBranch,
       gapYears: row.gapYears || 0,
       backlogs: row.backlogs || 0
     };
   }).filter(Boolean);




   setFailedStudents(failed);
   if (students.length === 0) return;




   try {
     const token = localStorage.getItem('adminToken');




     const res = await fetch(`${API_BASE}/api/admin/add-students-bulk`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ students }),
     });




     const result = await res.json();
     if (res.ok) toast.success( 'Students Added Successfully');
     else toast.error(result.message || 'Upload failed');




     if (failed.length > 0) {
       await fetch(`${API_BASE}/api/admin/send-rejection-mail`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({ failedStudents: failed }),
       });
     }
   } catch (err) {
     console.error("❌ Upload error:", err);
     toast.error("Bulk upload failed");
   }
 };




 reader.readAsArrayBuffer(file);
};












 return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-3xl border border-transparent p-6 md:p-8">
    <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         "flex flex-col flex-1 transition-all duration-300",
         isCollapsed ? "ml-20" : "ml-24"
       )}
     >
       <TopNav toggleSidebar={() => setIsCollapsed(prev => !prev)} isCollapsed={isCollapsed} />
       <Toaster />


       <main className="mt-[72px] px-6 py-10">
         <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
           Add Student
         </h1>
         <div className="max-w-3xl mx-auto">
           <StudentForm
             courses={courses}
             branches={availableBranches}
             onSubmit={handleManualSubmit}
             onExcelUpload={handleFileUpload}
             isSubmitting={isSubmitting}
             failedStudents={failedStudents}
             onCourseChange={setSelectedCourse}
           />
         </div>
       </main>
     </div>
   </div>
 );
};


export default AddStudent;





