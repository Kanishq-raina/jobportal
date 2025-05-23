import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/AdminComponents/Sidebar';
import TopNav from '../../components/AdminComponents/TopNav';
import StudentFilterBar from '../../components/AdminComponents/StudentFilterBar';
import { Toaster, toast } from 'react-hot-toast';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import MailBox from '../../components/AdminComponents/MailBox';
import StudentView from '../../components/AdminComponents/StudentView';
import clsx from 'clsx';


const StudentDetail = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [students, setStudents] = useState([]);
 const [selectedEmails, setSelectedEmails] = useState([]);
 const [selectAll, setSelectAll] = useState(false);
 const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const studentsPerPage = 50;


 const modalRef = useRef();
 const tableRef = useRef(null);


 const [filters, setFilters] = useState({
   name: '', email: '', cgpa: '', minCgpa: '', maxCgpa: '',
   backlogs: '', minBacklogs: '', maxBacklogs: '',
   semester: '', minSemester: '', maxSemester: '',
   course: '', branch: '', sortBy: '',
 });


 const buildQuery = () => {
   const query = new URLSearchParams();
   Object.entries(filters).forEach(([key, value]) => {
     if (value !== '' && value !== null && value !== undefined) {
       query.append(key, value);
     }
   });
   return query.toString();
 };


 const fetchStudents = async () => {
   try {
     const token = localStorage.getItem('adminToken');
     const res = await fetch(`http://localhost:5000/api/admin/students?${buildQuery()}`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     const data = await res.json();
     if (res.ok) {
       setStudents(data);
       setSelectedEmails([]);
       setSelectAll(false);
       setCurrentPage(1); // Reset to page 1 on fetch
     }
   } catch (err) {
     console.error('Error fetching students:', err);
   }
 };


 const fetchStudentDetail = async (id) => {
   try {
     if (!id || id === 'undefined') return toast.error("Invalid student ID");
     const token = localStorage.getItem('adminToken');
     const res = await fetch(`http://localhost:5000/api/admin/student/${id}`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     const data = await res.json();
     if (res.ok) {
       if (!data._id) data._id = id;
       setSelectedStudentDetail(data);
     } else toast.error("Failed to load student data");
   } catch {
     toast.error("Server error");
   }
 };


 useEffect(() => { fetchStudents(); }, [filters]);


 useEffect(() => {
   const handleClickOutside = (e) => {
     if (modalRef.current && !modalRef.current.contains(e.target)) {
       setSelectedStudentDetail(null);
     }
   };
   document.addEventListener("mousedown", handleClickOutside);
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);


 const toggleSelectAll = () => {
   setSelectAll(!selectAll);
   const currentPageEmails = paginatedStudents.map((s) => s.email);
   setSelectedEmails(!selectAll ? [...new Set([...selectedEmails, ...currentPageEmails])] : selectedEmails.filter(e => !currentPageEmails.includes(e)));
 };


 const toggleSingleSelect = (email) => {
   setSelectedEmails((prev) =>
     prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
   );
 };


 const handleBulkDelete = async () => {
   if (selectedEmails.length === 0) return toast.error("No students selected");
   if (!window.confirm("Are you sure you want to delete selected students?")) return;


   try {
     const token = localStorage.getItem("adminToken");
     const res = await fetch('http://localhost:5000/api/admin/delete-students', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
       },
       body: JSON.stringify({ emails: selectedEmails })
     });
     const data = await res.json();
     if (res.ok) {
       toast.success(`${data.deletedCount} student(s) deleted`);
       fetchStudents();
     } else toast.error(data.message || "Failed to delete");
   } catch (err) {
     console.error(err);
     toast.error("Server error");
   }
 };


 const handleStudentSave = async (updatedData) => {
   if (!updatedData._id || updatedData._id === "undefined") {
     toast.error("Student ID is missing or invalid");
     return;
   }


   try {
     const token = localStorage.getItem("adminToken");
     const res = await fetch(`http://localhost:5000/api/admin/update-student/${updatedData._id}`, {
       method: "PUT",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify(updatedData),
     });


     const data = await res.json();
     if (res.ok) {
       toast.success("Student updated successfully");
       setSelectedStudentDetail(null);
       fetchStudents();
     } else {
       toast.error(data.message || "Failed to update");
     }
   } catch (err) {
     console.error("Save error:", err);
     toast.error("Server error");
   }
 };


 const handleExcelUpload = async (e) => {
   const file = e.target.files[0];
   if (!file) return;


   const formData = new FormData();
   formData.append("file", file);


   try {
     const token = localStorage.getItem("adminToken");
     const res = await fetch("http://localhost:5000/api/admin/update-students-excel", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${token}`,
       },
       body: formData,
     });


     const data = await res.json();
     if (res.ok) {
       toast.success(data.message);
       fetchStudents();
     } else {
       toast.error(data.message || "Update failed");
     }
   } catch (err) {
     console.error("Upload error:", err);
     toast.error("Server error during Excel upload");
   }
 };


 // Pagination logic
 const indexOfLastStudent = currentPage * studentsPerPage;
 const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
 const paginatedStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
 const totalPages = Math.ceil(students.length / studentsPerPage);


 return (
   <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
     <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div className={clsx("flex flex-col flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-24")}>
       <TopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} isCollapsed={isCollapsed} />
       <Toaster />
       <main className="mt-[72px] px-6 py-10 text-gray-800 dark:text-white">
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
           <h1 className="text-4xl font-bold">All Students</h1>
           <div className="flex gap-4 flex-wrap">
             <DownloadTableExcel filename="Students_Export" sheet="Students" currentTableRef={tableRef.current}>
               <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                 Export to Excel
               </button>
             </DownloadTableExcel>
             {selectedEmails.length > 0 && (
               <button
                 onClick={handleBulkDelete}
                 className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
               >
                 Delete Selected ({selectedEmails.length})
               </button>
             )}
             <label className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
               Upload Excel
               <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
             </label>
           </div>
         </div>


         <StudentFilterBar filters={filters} setFilters={setFilters} />


         <div className="overflow-x-auto rounded-xl shadow border dark:border-gray-700">
           <table ref={tableRef} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
             <thead className="bg-gray-100 dark:bg-gray-800">
               <tr>
                 <th className="px-4 py-2 text-left">
                   <input type="checkbox" checked={paginatedStudents.every(s => selectedEmails.includes(s.email))} onChange={toggleSelectAll} />
                 </th>
                 <th className="px-4 py-2 text-left">Name</th>
                 <th className="px-4 py-2 text-left">Email</th>
                 <th className="px-4 py-2 text-left">CGPA</th>
                 <th className="px-4 py-2 text-left">Backlogs</th>
                 <th className="px-4 py-2 text-left">Semester</th>
                 <th className="px-4 py-2 text-left">Course</th>
                 <th className="px-4 py-2 text-left">Branch</th>
                 <th className="px-4 py-2 text-left">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
               {paginatedStudents.map((s) => (
                 <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                   <td className="px-4 py-2">
                     <input type="checkbox" checked={selectedEmails.includes(s.email)} onChange={() => toggleSingleSelect(s.email)} />
                   </td>
                   <td className="px-4 py-2">{s.name || '-'}</td>
                   <td className="px-4 py-2">{s.email || '-'}</td>
                   <td className="px-4 py-2">{s.cgpa ?? '-'}</td>
                   <td className="px-4 py-2">{s.backlogs ?? '-'}</td>
                   <td className="px-4 py-2">{s.semester ?? '-'}</td>
                   <td className="px-4 py-2">{s.course || '-'}</td>
                   <td className="px-4 py-2">{s.branch || '-'}</td>
                   <td className="px-4 py-2">
                     <button onClick={() => fetchStudentDetail(s._id)} className="text-blue-600 hover:underline">View</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
           {students.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No students found</p>}
         </div>


         {/* Pagination */}
         <div className="mt-4 flex justify-center gap-4">
           <button
             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
             onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
             disabled={currentPage === 1}
           >
             Previous
           </button>
           <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
           <button
             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
             onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
             disabled={currentPage === totalPages}
           >
             Next
           </button>
         </div>


         {selectedStudentDetail && (
           <StudentView
             student={selectedStudentDetail}
             onClose={() => setSelectedStudentDetail(null)}
             onSave={handleStudentSave}
           />
         )}


         <MailBox recipients={selectedEmails} />
       </main>
     </div>
   </div>
 );
};


export default StudentDetail;





