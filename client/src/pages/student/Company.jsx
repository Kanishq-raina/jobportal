import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Sidebar from "../../components/StudentComponents/StudentSidebar";
import TopNav from "../../components/StudentComponents/StudentTopNav";
import JobCard from "../../components/StudentComponents/JobCard";
import { Toaster, toast } from "react-hot-toast";




const Company = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [jobs, setJobs] = useState([]);
 const [eligibleJobs, setEligibleJobs] = useState([]);
 const [nonEligibleJobs, setNonEligibleJobs] = useState([]);
 const [appliedEligibleJobs, setAppliedEligibleJobs] = useState([]);
 const [notAppliedEligibleJobs, setNotAppliedEligibleJobs] = useState([]);
 const [filteredJobs, setFilteredJobs] = useState([]);
 const [searchTerm, setSearchTerm] = useState("");
 const [filterType, setFilterType] = useState(null);
 const [applicationFilter, setApplicationFilter] = useState(null);
 const [studentInfo, setStudentInfo] = useState(null);




 const checkEligibility = (student, job) => {
   if (!student || !job.eligibility) return { eligible: false };
   const e = job.eligibility;




   const cgpaOk = Number(student.cgpa || 0) >= (e.minCGPA || 0);
   const backlogOk = Number(student.backlogs || 0) <= (e.maxBacklogs || 0);
   const gapOk = Number(student.gapYears || 0) <= (e.allowedGapYears || 0);
   const tenthOk = Number(student.tenthPercent || 0) >= (e.minTenthPercent || 0);
   const twelfthOk = Number(student.twelfthPercent || 0) >= (e.minTwelfthPercent || 0);
   const semOk = (e.semestersAllowed || []).includes(Number(student.semester));
   const branchOk = (e.branchesAllowed || []).map(b => b.toLowerCase().trim()).includes((student.branch || "").toLowerCase().trim());
   const courseOk = (job.coursesAllowed || []).map(c => c.toLowerCase().trim()).includes((student.course || "").toLowerCase().trim());




   const eligible = cgpaOk && backlogOk && gapOk && tenthOk && twelfthOk && semOk && branchOk && courseOk;




   return {
     cgpaOk, backlogOk, gapOk, tenthOk, twelfthOk, semOk, branchOk, courseOk, eligible
   };
 };




 const fetchJobs = async () => {
   try {
     const token = localStorage.getItem("studentToken");




     const [jobRes, studentRes] = await Promise.all([
       fetch("https://jobportal-xqgm.onrender.com/api/student/jobs", {
         headers: { Authorization: `Bearer ${token}` },
       }),
       fetch("https://jobportal-xqgm.onrender.com/api/student/profile", {
         headers: { Authorization: `Bearer ${token}` },
       }),
     ]);




     const jobData = await jobRes.json();
     const studentData = await studentRes.json();




     if (jobRes.ok && studentRes.ok) {
       jobData.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
       setJobs(jobData);
       setStudentInfo(studentData);




       const eligible = [], nonEligible = [], applied = [], notApplied = [];




       jobData.forEach((job) => {
         const isEligible = checkEligibility(studentData, job).eligible;
         if (isEligible) {
           eligible.push(job);
           job.applied ? applied.push(job) : notApplied.push(job);
         } else {
           nonEligible.push(job);
         }
       });




       setEligibleJobs(eligible);
       setAppliedEligibleJobs(applied);
       setNotAppliedEligibleJobs(notApplied);
       setNonEligibleJobs(nonEligible);
       setFilteredJobs(jobData);
     } else {
       toast.error("Failed to fetch data");
     }
   } catch (err) {
     console.error("Fetch error:", err);
     toast.error("Server error while loading data");
   }
 };




 const applyFilters = () => {
   const lowerSearch = searchTerm.trim().toLowerCase();
   let baseJobs = jobs;




   if (filterType === "eligible") {
     if (applicationFilter === "applied") baseJobs = appliedEligibleJobs;
     else if (applicationFilter === "not-applied") baseJobs = notAppliedEligibleJobs;
     else baseJobs = eligibleJobs;
   } else if (filterType === "non-eligible") {
     baseJobs = nonEligibleJobs;
   }




   const filtered = baseJobs.filter((job) =>
     job.title?.toLowerCase().includes(lowerSearch) ||
     job.company?.toLowerCase().includes(lowerSearch) ||
     job.description?.toLowerCase().includes(lowerSearch)
   );




   setFilteredJobs(filtered);
 };




 const clearFilters = () => {
   setSearchTerm("");
   setFilterType(null);
   setApplicationFilter(null);
   setFilteredJobs(jobs);
 };




 const handleApply = async (job) => {
   const token = localStorage.getItem("studentToken");




   const result = checkEligibility(studentInfo, job);
   if (!result.eligible) {
     const reasons = Object.entries(result)
       .filter(([key, value]) => key !== "eligible" && value === false)
       .map(([key]) => key.replace("Ok", "").toUpperCase())
       .join(", ");
     toast.error(`You are not eligible. Failing: ${reasons}`);
     return;
   }




   try {
     const res = await fetch(`https://jobportal-xqgm.onrender.com/api/student/apply/${job._id}`, {
       method: "POST",
       headers: { Authorization: `Bearer ${token}` },
     });




     const data = await res.json();




     if (!res.ok) {
       if (data.missing) {
         toast.error(`Missing: ${data.missing.join(", ")}`);
       } else if (data.failingCriteria) {
         toast.error(`Ineligible: ${data.failingCriteria.join(", ")}`);
       } else {
         toast.error(data.message);
       }
     } else {
       toast.success(data.message);




       // Update job state
       setJobs(prev => prev.map(j => j._id === job._id ? { ...j, applied: true } : j));
       setEligibleJobs(prev => prev.map(j => j._id === job._id ? { ...j, applied: true } : j));
       setAppliedEligibleJobs(prev => [...prev, { ...job, applied: true }]);
       setNotAppliedEligibleJobs(prev => prev.filter(j => j._id !== job._id));
       applyFilters(); // reapply filters with updated data
     }
   } catch (err) {
     console.error("Apply error:", err);
     toast.error("Server error while applying.");
   }
 };




 useEffect(() => {
   fetchJobs();
 }, []);




 useEffect(() => {
   applyFilters();
 }, [searchTerm, filterType, applicationFilter]);




 return (
   <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
     <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         "flex flex-col flex-1 transition-all duration-300",
         isCollapsed ? "ml-[72px]" : "ml-24"
       )}
     >
       <TopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} isCollapsed={isCollapsed} />
       <Toaster />




       <main className="mt-[72px] px-6 py-10 text-gray-800 dark:text-white overflow-y-auto max-h-[calc(100vh-4rem)]">
         <h1 className="text-4xl font-bold mb-6">Available Jobs</h1>




         <div className="flex flex-wrap gap-3 mb-6 items-center">
           <button onClick={() => setFilterType("eligible")} className="px-3 py-1 rounded bg-green-500 text-white text-sm">
             Eligible Jobs
           </button>
           <button onClick={() => setFilterType("non-eligible")} className="px-3 py-1 rounded bg-red-500 text-white text-sm">
             Non-Eligible Jobs
           </button>
           <button onClick={clearFilters} className="px-3 py-1 rounded bg-yellow-500 text-white text-sm">
             Clear Filters
           </button>




           {filterType === "eligible" && (
             <>
               <button onClick={() => setApplicationFilter("applied")} className="px-3 py-1 rounded bg-blue-500 text-white text-sm">
                 Applied
               </button>
               <button onClick={() => setApplicationFilter("not-applied")} className="px-3 py-1 rounded bg-purple-600 text-white text-sm">
                 Not Applied
               </button>
             </>
           )}




           <input
             type="text"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Search jobs..."
             className="px-3 py-1 rounded border text-sm dark:bg-gray-700"
           />
         </div>




         {filteredJobs.length === 0 ? (
           <p className="text-gray-500 dark:text-gray-400">No jobs found.</p>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredJobs.map((job) => {
               const eligibility = checkEligibility(studentInfo, job);
               return (
                 <JobCard
                   key={job._id}
                   job={job}
                   onApply={() => handleApply(job)}
                   isEligible={eligibility.eligible}
                   ineligibleReasons={eligibility}
                 />
               );
             })}
           </div>
         )}
       </main>
     </div>
   </div>
 );
};




export default Company;















