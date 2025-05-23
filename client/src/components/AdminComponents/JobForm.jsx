import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
 FiBriefcase, FiDollarSign, FiUsers, FiCalendar, FiUpload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';


const schema = yup.object({
 title: yup.string().required('Job title is required.'),
 description: yup.string().required('Description is required.'),
 salary: yup
   .number()
   .typeError('Salary must be a number.')
   .min(1, 'Salary must be at least 1.')
   .test('decimal-places', 'Up to 2 decimals allowed.', val => /^\d+(\.\d{1,2})?$/.test(val))
   .required('Salary is required.'),
 vacancy: yup
   .number()
   .typeError('Vacancy must be a number.')
   .integer()
   .min(1)
   .required(),
 deadline: yup.string().required(),
 minCGPA: yup
   .number()
   .typeError('CGPA must be a number.')
   .min(0)
   .max(10)
   .test('decimal-places', 'Up to 2 decimals allowed.', val => /^\d+(\.\d{1,2})?$/.test(val))
   .required(),
 maxBacklogs: yup
   .number()
   .typeError('Backlogs must be a number.')
   .min(0)
   .max(5)
   .required(),
 allowedGapYears: yup
   .number()
   .typeError('Gap years must be a number.')
   .min(0)
   .max(4)
   .required(),
 semestersAllowed: yup
   .number()
   .typeError('Semester must be a number.')
   .min(1)
   .max(10)
   .required(),
 minTenthPercent: yup
   .number()
   .min(30)
   .max(100)
   .test('decimal-places', 'Up to 2 decimals allowed.', val => /^\d+(\.\d{1,2})?$/.test(val))
   .required(),
 minTwelfthPercent: yup
   .number()
   .min(30)
   .max(100)
   .test('decimal-places', 'Up to 2 decimals allowed.', val => /^\d+(\.\d{1,2})?$/.test(val))
   .required(),
 coursesAllowed: yup.array().min(1, 'Select at least one course.'),
 branchesAllowed: yup.array().min(1, 'Select at least one branch.')
});


const JobForm = ({ onSubmit, onExcelUpload, courses = [] }) => {
 const [availableBranches, setAvailableBranches] = useState([]);
 const [logo, setLogo] = useState(null);
 const [excelFile, setExcelFile] = useState(null);
 const [activeTab, setActiveTab] = useState('manual');
 const [isUploading, setIsUploading] = useState(false);


 const {
   register,
   handleSubmit,
   setValue,
   watch,
   formState: { errors, isValid },
   reset
 } = useForm({ resolver: yupResolver(schema), mode: 'onChange' });


 const watchCourses = watch('coursesAllowed', []);


 useEffect(() => {
   const selected = courses.filter(c => watchCourses.includes(c.name));
   const branches = [...new Set(selected.flatMap(c => c.branches))];
   setAvailableBranches(branches);
   setValue('branchesAllowed', []);
 }, [watchCourses, courses, setValue]);


 const internalSubmit = (data) => {
   if (!logo) return toast.error('Logo is required');
   onSubmit(data, logo);
   toast.success('✅ Job added successfully');
   reset();
   setLogo(null);
 };


 const handleDrop = (e) => {
   e.preventDefault();
   const file = e.dataTransfer.files?.[0];
   if (file && file.name.endsWith('.xlsx')) {
     setExcelFile(file);
     toast.success("✅ File dropped");
   } else {
     toast.error("❌ Invalid file type");
   }
 };


 const handleExcelFileChange = (e) => {
   const file = e.target.files?.[0];
   if (file && file.name.endsWith('.xlsx')) {
     setExcelFile(file);
     toast.success("✅ File selected");
   } else {
     toast.error("❌ Invalid file type");
     e.target.value = "";
   }
 };


 const handleExcelUploadClick = async () => {
   if (!excelFile) return;
   setIsUploading(true);
   try {
     await onExcelUpload(excelFile);
     toast.success("✅ Excel uploaded");
     setExcelFile(null);
     document.getElementById("job-excel-input").value = "";
   } catch {
     toast.error("❌ Upload failed");
   } finally {
     setIsUploading(false);
   }
 };


 const Label = ({ icon, text }) => (
   <label className="block mb-1 flex items-center gap-2 font-semibold">
     {icon} {text}
   </label>
 );


 return (
   <div className="w-full max-w-7xl mx-auto">
     <div className="flex justify-center gap-6 mb-6">
       <button
         onClick={() => setActiveTab('manual')}
         className={`px-5 py-2 rounded-xl font-semibold transition duration-300 ${
           activeTab === 'manual'
             ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
             : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
         }`}
       >
         ➕ Add Manually
       </button>
       <button
         onClick={() => setActiveTab('excel')}
         className={`px-5 py-2 rounded-xl font-semibold transition duration-300 ${
           activeTab === 'excel'
             ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
             : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
         }`}
       >
         📥 Upload Excel
       </button>
     </div>


     <div className="perspective">
       <div className={`relative w-full transition-transform duration-700 transform-style preserve-3d ${activeTab === 'manual' ? 'rotate-y-0' : 'rotate-y-180'}`}>
        
         {/* Manual Form with Shadow Background */}
         <div className="absolute w-full backface-hidden">
           <div className="shadow-[0_12px_50px_rgba(0,0,0,0.25)] bg-white dark:bg-gray-800 p-8 rounded-2xl">
             <form onSubmit={handleSubmit(internalSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Left */}
               <div className="space-y-4">
                 <div><Label icon={<FiBriefcase />} text="Job Title" /><input {...register('title')} className="input w-full" />{errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="Description" /><textarea {...register('description')} rows={3} className="input w-full" />{errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}</div>
                 <div><Label icon={<FiUpload />} text="Upload Logo" /><input type="file" accept=".jpg,.jpeg,.png" onChange={e => setLogo(e.target.files[0])} className="input w-full" /></div>
                 <div><Label icon={<FiDollarSign />} text="Salary" /><input type="number" step="0.01" {...register('salary')} className="input w-full" />{errors.salary && <p className="text-red-500 text-sm">{errors.salary.message}</p>}</div>
                 <div><Label icon={<FiUsers />} text="Vacancy" /><input type="number" {...register('vacancy')} className="input w-full" />{errors.vacancy && <p className="text-red-500 text-sm">{errors.vacancy.message}</p>}</div>
                 <div><Label icon={<FiCalendar />} text="Deadline" /><input type="date" {...register('deadline')} className="input w-full" />{errors.deadline && <p className="text-red-500 text-sm">{errors.deadline.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="Minimum CGPA" /><input type="number" step="0.01" {...register('minCGPA')} className="input w-full" />{errors.minCGPA && <p className="text-red-500 text-sm">{errors.minCGPA.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="Max Backlogs" /><input type="number" {...register('maxBacklogs')} className="input w-full" />{errors.maxBacklogs && <p className="text-red-500 text-sm">{errors.maxBacklogs.message}</p>}</div>
               </div>


               {/* Right */}
               <div className="space-y-4">
                 <div><Label icon={<FiBriefcase />} text="Gap Years" /><input type="number" {...register('allowedGapYears')} className="input w-full" />{errors.allowedGapYears && <p className="text-red-500 text-sm">{errors.allowedGapYears.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="Semester Allowed" /><input type="number" {...register('semestersAllowed')} className="input w-full" />{errors.semestersAllowed && <p className="text-red-500 text-sm">{errors.semestersAllowed.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="10th %" /><input type="number" step="0.01" {...register('minTenthPercent')} className="input w-full" />{errors.minTenthPercent && <p className="text-red-500 text-sm">{errors.minTenthPercent.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="12th %" /><input type="number" step="0.01" {...register('minTwelfthPercent')} className="input w-full" />{errors.minTwelfthPercent && <p className="text-red-500 text-sm">{errors.minTwelfthPercent.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="Eligible Courses" /><select multiple {...register('coursesAllowed')} className="input w-full h-32">{courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}</select>{errors.coursesAllowed && <p className="text-red-500 text-sm">{errors.coursesAllowed.message}</p>}</div>
                 <div><Label icon={<FiBriefcase />} text="Eligible Branches" /><select multiple {...register('branchesAllowed')} className="input w-full h-32">{availableBranches.map(b => <option key={b} value={b}>{b}</option>)}</select>{errors.branchesAllowed && <p className="text-red-500 text-sm">{errors.branchesAllowed.message}</p>}</div>
               </div>


               <div className="col-span-full flex justify-center mt-6">
                 <button type="submit" className={`w-48 px-4 py-2 rounded-xl text-white text-lg font-semibold ${isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                   Submit Job
                 </button>
               </div>
             </form>
           </div>
         </div>


         {/* Excel Upload */}
         <div className="absolute w-full rotate-y-180 backface-hidden">
           <form
             onSubmit={(e) => e.preventDefault()}
             onDragOver={(e) => e.preventDefault()}
             onDrop={handleDrop}
             className="bg-white dark:bg-gray-800 p-6 rounded-xl space-y-6"
           >
             <h2 className="text-xl font-semibold mb-4">Upload Jobs via Excel</h2>
             <p className="mb-2 text-gray-600 dark:text-gray-300">📂 Drag and drop Excel file below or browse to upload</p>


             <div className="border-2 border-dashed border-gray-400 p-6 rounded-xl text-center dark:text-white">
               <p className="mb-2">Drop Excel file here</p>
               <p className="text-sm text-gray-500 dark:text-gray-300">Only .xlsx files supported</p>
             </div>


             <div className="relative">
               <input
                 type="file"
                 id="job-excel-input"
                 accept=".xlsx"
                 onChange={handleExcelFileChange}
                 className="block w-full text-sm text-gray-500 dark:text-gray-300 mb-2"
               />
               {isUploading && (
                 <div className="absolute top-1 right-2 w-5 h-5 border-4 border-t-transparent border-green-600 rounded-full animate-spin" />
               )}
             </div>


             {excelFile && (
               <div className="flex items-center justify-between gap-4">
                 <button
                   type="button"
                   onClick={handleExcelUploadClick}
                   disabled={isUploading}
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


     <style>{`
       .perspective {
         perspective: 2000px;
       }
       .preserve-3d {
         transform-style: preserve-3d;
       }
       .rotate-y-0 {
         transform: rotateY(0deg);
       }
       .rotate-y-180 {
         transform: rotateY(180deg);
       }
       .backface-hidden {
         backface-visibility: hidden;
       }
     `}</style>
   </div>
 );
};


export default JobForm;





