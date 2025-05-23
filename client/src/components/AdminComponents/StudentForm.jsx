import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
 FaUser, FaEnvelope, FaGraduationCap, FaCodeBranch,
 FaLayerGroup, FaBug, FaUserGraduate
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';


const capitalizeFullName = (str) =>
 str?.trim().split(/\s+/).map(
   word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
 ).join(" ");


const schema = yup.object().shape({
 firstName: yup.string().matches(/^[A-Za-z\s]+$/, 'Only alphabets and spaces allowed').required('First name required'),
 lastName: yup.string().matches(/^[A-Za-z\s]*$/, 'Only alphabets and spaces allowed'),
 email: yup.string().matches(/@(gmail|hotmail|rediffmail)\.com$/, 'Use approved domains').required('Email required'),
 course: yup.string().required('Course required'),
 branch: yup.string().required('Branch required'),
 semester: yup.number().min(1).max(10).required('Semester required'),
 cgpa: yup.number().typeError('CGPA must be a number').min(0).max(10).test('decimal-places', 'Max 2 decimals', val => /^\d+(\.\d{1,2})?$/.test(val)).required('CGPA required'),
 backlogs: yup.number().min(0).max(40).required('Backlogs required'),
 gapYears: yup.number().min(0).max(4).required('Gap years required'),
 tenthPercent: yup.number().typeError('10th % must be a number').min(30).max(100).test('decimal-places', 'Max 2 decimals', val => /^\d+(\.\d{1,2})?$/.test(val)).required('10th % required'),
 twelfthPercent: yup.number().typeError('12th % must be a number').min(30).max(100).test('decimal-places', 'Max 2 decimals', val => /^\d+(\.\d{1,2})?$/.test(val)).required('12th % required'),
});


const StudentForm = ({
 courses,
 branches,
 onSubmit,
 onExcelUpload,
 isSubmitting,
 failedStudents,
 onCourseChange
}) => {
 const [activeTab, setActiveTab] = useState('manual');
 const [excelFile, setExcelFile] = useState(null);
 const [isUploading, setIsUploading] = useState(false);


 const {
   register,
   handleSubmit,
   formState: { errors },
   reset
 } = useForm({
   resolver: yupResolver(schema),
   mode: 'onChange'
 });


 const renderInput = (label, name, icon, type = 'text', options = []) => {
   const hasError = !!errors[name];
   if (type === 'select') {
     return (
       <div className="mb-4">
         <label className="block font-semibold mb-1" htmlFor={name}>
           {icon} {label}
         </label>
         <select
           {...register(name)}
           id={name}
           className={`input w-full ${hasError ? 'border-red-500 ring-2 ring-red-400' : ''}`}
           onChange={(e) => {
             if (name === 'course') onCourseChange(e.target.value);
             return e.target.dispatchEvent(new Event('input', { bubbles: true }));
           }}
         >
           <option value="">Select {label}</option>
           {options.map((opt, i) => (
             <option key={i} value={opt}>{opt}</option>
           ))}
         </select>
         {hasError && <p className="text-sm text-red-600 mt-1">{errors[name]?.message}</p>}
       </div>
     );
   }
   return (
     <div className="mb-4">
       <label className="block font-semibold mb-1" htmlFor={name}>
         {icon} {label}
       </label>
       <input
         type={type}
         {...register(name)}
         id={name}
         step={['cgpa', 'tenthPercent', 'twelfthPercent'].includes(name) ? '0.01' : undefined}
         inputMode={type === 'number' ? 'decimal' : undefined}
         className={`input w-full ${hasError ? 'border-red-500 ring-2 ring-red-400' : ''}`}
         onBlur={(e) => {
           if (['firstName', 'lastName'].includes(name)) {
             const value = capitalizeFullName(e.target.value);
             e.target.value = value;
             e.target.dispatchEvent(new Event('input', { bubbles: true }));
           }
         }}
       />
       {hasError && <p className="text-sm text-red-600 mt-1">{errors[name]?.message}</p>}
     </div>
   );
 };


 const handleExcelUpload = async () => {
   if (!excelFile) return;
   setIsUploading(true);
   try {
     await onExcelUpload(excelFile);
     toast.success("✅ Excel uploaded successfully");
     setExcelFile(null);
     document.getElementById("excel-upload-input").value = "";
   } catch {
     toast.error("❌ Upload failed");
   } finally {
     setIsUploading(false);
   }
 };


 return (
   <>
     <div className="flex justify-center gap-6 mb-6">
       <button
         onClick={() => setActiveTab('manual')}
         className={`px-5 py-2 rounded-xl font-semibold transition duration-300 ${activeTab === 'manual' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
       >
         ➕ Add Manually
       </button>
       <button
         onClick={() => setActiveTab('excel')}
         className={`px-5 py-2 rounded-xl font-semibold transition duration-300 ${activeTab === 'excel' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
       >
         📥 Upload Excel
       </button>
     </div>


     <div className="perspective">
       <div className={`relative w-full transition-transform duration-700 transform-style preserve-3d ${activeTab === 'excel' ? 'rotate-y-180' : ''}`}>


         {/* Front: Manual */}
         <div className="absolute w-full backface-hidden">
           <form onSubmit={handleSubmit((data) => onSubmit(data, reset))} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl space-y-4 w-full">
             <h2 className="text-xl font-semibold mb-2">Manually Add Student</h2>
             {renderInput("First Name", "firstName", <FaUser className="inline mr-1" />)}
             {renderInput("Last Name", "lastName", <FaUser className="inline mr-1" />)}
             {renderInput("Email", "email", <FaEnvelope className="inline mr-1" />)}
             {renderInput("Course", "course", <FaCodeBranch className="inline mr-1" />, "select", courses.map(c => c.name))}
             {renderInput("Branch", "branch", <FaCodeBranch className="inline mr-1" />, "select", branches)}
             {renderInput("Semester", "semester", <FaLayerGroup className="inline mr-1" />, "select", Array.from({ length: 8 }, (_, i) => i + 1))}
             {renderInput("CGPA", "cgpa", <FaGraduationCap className="inline mr-1" />, "number")}
             {renderInput("Backlogs", "backlogs", <FaBug className="inline mr-1" />, "select", Array.from({ length: 26 }, (_, i) => i))}
             {renderInput("Gap Years", "gapYears", <FaUserGraduate className="inline mr-1" />, "select", [0, 1, 2, 3, 4])}
             {renderInput("10th Percentage", "tenthPercent", <FaGraduationCap className="inline mr-1" />, "number")}
             {renderInput("12th Percentage", "twelfthPercent", <FaGraduationCap className="inline mr-1" />, "number")}
             <button type="submit" disabled={isSubmitting} className={`w-full px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
               {isSubmitting ? 'Submitting...' : 'Add Student'}
             </button>
           </form>
         </div>


         {/* Back: Excel Upload */}
         <div className="absolute w-full rotate-y-180 backface-hidden">
           <form
             onSubmit={(e) => e.preventDefault()}
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => {
               e.preventDefault();
               const file = e.dataTransfer.files?.[0];
               if (file && file.name.endsWith('.xlsx')) {
                 setExcelFile(file);
                 toast.success("✅ File dropped");
               } else {
                 toast.error("❌ Invalid file type");
               }
             }}
             className="bg-white dark:bg-gray-800 p-6 rounded-xl space-y-6"
           >
             <h2 className="text-xl font-semibold mb-4">Upload Students via Excel</h2>
             <div className="text-gray-600 dark:text-gray-300">
               <p className="mb-2">📂 Drag and drop Excel file below or browse to upload</p>
               <p className="text-sm mb-4">Required columns: <strong>firstName, lastName, email, course, branch, cgpa, semester, backlogs, gapYears</strong></p>
             </div>


             <div className="border-2 border-dashed border-gray-400 p-6 rounded-xl text-center dark:text-white">
               <p className="mb-2">Drop Excel file here</p>
               <p className="text-sm text-gray-500 dark:text-gray-300">Only .xlsx or .xls files supported</p>
             </div>


             <div className="relative">
               <input
                 type="file"
                 id="excel-upload-input"
                 accept=".xlsx, .xls"
                 onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     setExcelFile(file);
                     toast.success("✅ File selected");
                   } else {
                     toast.error("❌ Invalid file type");
                   }
                 }}
                 className="block w-full text-sm text-gray-500 dark:text-gray-300 mb-2"
               />
               {isUploading && (
                 <div className="absolute top-1 right-2 w-5 h-5 border-4 border-t-transparent border-blue-600 rounded-full animate-spin" />
               )}
             </div>


             {excelFile && (
               <div className="flex items-center justify-between gap-4">
                 <button
                   type="button"
                   disabled={isUploading}
                   onClick={handleExcelUpload}
                   className={`py-2 px-6 rounded font-semibold text-white ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                 >
                   📤 Upload Excel
                 </button>
               </div>
             )}
           </form>
         </div>
       </div>
     </div>


     {failedStudents?.length > 0 && (
       <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md max-w-xl mt-4">
         <h3 className="font-bold mb-2">Failed to Add:</h3>
         <ul className="list-disc ml-5 text-sm">
           {failedStudents.map((f, idx) => (
             <li key={idx}><strong>{f.email}</strong>: {f.reason}</li>
           ))}
         </ul>
       </div>
     )}


     <style>{`
       .perspective {
         perspective: 1500px;
       }
       .preserve-3d {
         transform-style: preserve-3d;
       }
       .backface-hidden {
         backface-visibility: hidden;
       }
       .rotate-y-180 {
         transform: rotateY(180deg);
       }
     `}</style>
   </>
 );
};


export default StudentForm;





