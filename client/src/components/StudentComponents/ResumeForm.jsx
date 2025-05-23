import React from "react";
import { FiPlus } from "react-icons/fi";


const glowBtn =
 "px-3 py-1 font-medium rounded-xl bg-gradient-to-br from-green-400 to-blue-600 text-white shadow-[0_5px_20px_rgba(59,130,246,0.6)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.7)] active:scale-95 transition-transform duration-300";


const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
const skillOptions = Array.from({ length: 100 }, (_, i) => `Skill ${i + 1}`);


const ResumeForm = ({
 objective, setObjective,
 education, setEducation,
 workExperience, setWorkExperience,
 skills, setSkills,
 projects, setProjects,
 strengths, setStrengths,
 achievements, setAchievements,
 interests, setInterests,
 photo, setPhoto,
 address, setAddress,
}) => {
 const updateArray = (list, setList, index, field, value) => {
   const updated = [...list];
   updated[index][field] = value;
   setList(updated);
 };


 const updateSimpleArray = (list, setList, index, value) => {
   const updated = [...list];
   updated[index] = value;
   setList(updated);
 };


 const calculateDuration = (from, to) => {
   if (!from || !to) return "";
   const start = new Date(from);
   const end = new Date(to);
   const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
   const years = Math.floor(months / 12);
   const remMonths = months % 12;
   return `${years ? years + " yr" : ""}${remMonths ? " " + remMonths + " mo" : ""}`;
 };


 return (
   <div className="space-y-6 bg-white text-black p-6 rounded-3xl border border-gray-300 shadow-xl">
     {/* Upload Photo */}
     <div>
       <h2 className="text-xl font-bold mb-2">Upload Photo</h2>
       <input
         type="file"
         accept="image/*"
         onChange={(e) => setPhoto(e.target.files[0])}
         className="mb-2"
       />
       {photo && (
         <div className="w-24 h-24 border rounded-full overflow-hidden">
           <img
             src={photo instanceof File ? URL.createObjectURL(photo) : photo}
             alt="Uploaded Preview"
             className="w-full h-full object-cover"
           />
         </div>
       )}
     </div>


     {/* Address */}
     <div>
       <h2 className="text-xl font-bold mb-2">Address</h2>
       <input
         value={address}
         onChange={e => setAddress(e.target.value)}
         placeholder="Enter your full address"
         className="w-full px-4 py-2 rounded-lg border bg-white text-black"
       />
     </div>


     {/* Career Objective */}
     <div>
       <h2 className="text-xl font-bold mb-2">Career Objective</h2>
       <textarea
         value={objective}
         onChange={(e) => setObjective(e.target.value)}
         placeholder="Write your career objective..."
         className="w-full px-4 py-2 rounded-lg border bg-white text-black"
       />
     </div>


     {/* Education */}
     <div>
       <h2 className="text-xl font-bold mb-2">Education</h2>
       <table className="w-full table-auto border border-gray-300">
         <thead className="bg-gray-100">
           <tr>
             <th className="border p-2">Institution</th>
             <th className="border p-2">Passing Year</th>
             <th className="border p-2">Percentage</th>
           </tr>
         </thead>
         <tbody>
           {education.map((edu, i) => (
             <tr key={i}>
               <td className="border p-2">
                 <input
                   className="w-full p-1 border rounded"
                   placeholder="Institution"
                   value={edu.institution}
                   onChange={e => updateArray(education, setEducation, i, "institution", e.target.value)}
                 />
               </td>
               <td className="border p-2">
                 <select
                   className="w-full p-1 border rounded"
                   value={edu.passingYear}
                   onChange={e => updateArray(education, setEducation, i, "passingYear", e.target.value)}
                 >
                   <option value="">Select Year</option>
                   {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
               </td>
               <td className="border p-2">
                 <input
                   className="w-full p-1 border rounded"
                   placeholder="%"
                   value={edu.percentage}
                   onChange={e => updateArray(education, setEducation, i, "percentage", e.target.value)}
                 />
               </td>
             </tr>
           ))}
         </tbody>
       </table>
       <button
         onClick={() => setEducation([...education, { institution: "", passingYear: "", percentage: "" }])}
         className={glowBtn}><FiPlus /> Add</button>
     </div>


     {/* Work Experience */}
     <div>
       <h2 className="text-xl font-bold mb-2">Work Experience</h2>
       {workExperience.map((exp, i) => (
         <div key={i} className="space-y-2 mb-3">
           <input placeholder="Position" value={exp.position}
             onChange={e => updateArray(workExperience, setWorkExperience, i, "position", e.target.value)}
             className="w-full p-2 rounded border text-black" />
           <input placeholder="Company" value={exp.company}
             onChange={e => updateArray(workExperience, setWorkExperience, i, "company", e.target.value)}
             className="w-full p-2 rounded border text-black" />
           <div className="flex gap-2">
             <input type="date" value={exp.from}
               onChange={e => updateArray(workExperience, setWorkExperience, i, "from", e.target.value)}
               className="p-2 rounded border text-black w-full" />
             <input type="date" value={exp.to}
               onChange={e => updateArray(workExperience, setWorkExperience, i, "to", e.target.value)}
               className="p-2 rounded border text-black w-full" />
           </div>
           <p className="text-sm text-gray-600">Duration: {calculateDuration(exp.from, exp.to)}</p>
           <label className="text-sm font-semibold">Work Description</label>
           <textarea
             rows={3}
             placeholder="Each point on a new line"
             value={exp.bullets.join("\n")}
             onChange={e => updateArray(workExperience, setWorkExperience, i, "bullets", e.target.value.split("\n"))}
             className="w-full p-2 rounded border text-black"
           />
         </div>
       ))}
       <button
         onClick={() => setWorkExperience([...workExperience, { position: "", company: "", from: "", to: "", bullets: [""] }])}
         className={glowBtn}><FiPlus /> Add</button>
     </div>




     {/* Skills */}
     <div>
       <h2 className="text-xl font-bold text-gray-800 mb-2">Skills</h2>
       {skills.map((skill, i) => (
         <div key={i} className="grid md:grid-cols-2 gap-2 mb-2">
           <input
             list={`skills-${i}`}
             value={skill.name}
             onChange={e => updateArray(skills, setSkills, i, "name", e.target.value)}
             placeholder="Search skill..."
             className="p-2 rounded border"
           />
           <datalist id={`skills-${i}`}>
             {skillOptions.map((s) => <option key={s} value={s} />)}
           </datalist>
           <input
             type="range"
             min="1"
             max="5"
             step="0.5"
             value={skill.rating}
             onChange={e => updateArray(skills, setSkills, i, "rating", parseFloat(e.target.value))}
           />
           <p className="text-sm text-gray-500">Rating: {skill.rating}</p>
         </div>
       ))}
       <button onClick={() => setSkills([...skills, { name: "", rating: 3 }])} className={glowBtn}><FiPlus /> Add</button>
     </div>




     {/* Projects */}
     <div>
       <h2 className="text-xl font-bold text-gray-800 mb-2">Projects</h2>
       {projects.map((proj, i) => (
         <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
           <input
             placeholder="Project Name"
             value={proj.name}
             onChange={e => updateArray(projects, setProjects, i, "name", e.target.value)}
             className="p-2 rounded border"
           />
           <input
             placeholder="Description"
             value={proj.description}
             onChange={e => updateArray(projects, setProjects, i, "description", e.target.value)}
             className="p-2 rounded border"
           />
         </div>
       ))}
       <button onClick={() => setProjects([...projects, { name: "", description: "" }])} className={glowBtn}><FiPlus /> Add</button>
     </div>




     {/* Strengths */}
     <div>
       <h2 className="text-xl font-bold text-gray-800 mb-2">Strengths</h2>
       {strengths.map((val, i) => (
         <input key={i} value={val} placeholder="Strength" onChange={e => updateSimpleArray(strengths, setStrengths, i, e.target.value)} className="w-full mb-2 p-2 rounded border" />
       ))}
       <button onClick={() => setStrengths([...strengths, ""])} className={glowBtn}><FiPlus /> Add</button>
     </div>




     {/* Achievements */}
     <div>
       <h2 className="text-xl font-bold text-gray-800 mb-2">Achievements</h2>
       {achievements.map((val, i) => (
         <input key={i} value={val} placeholder="Achievement" onChange={e => updateSimpleArray(achievements, setAchievements, i, e.target.value)} className="w-full mb-2 p-2 rounded border" />
       ))}
       <button onClick={() => setAchievements([...achievements, ""])} className={glowBtn}><FiPlus /> Add</button>
     </div>




     {/* Interests */}
     <div>
       <h2 className="text-xl font-bold text-gray-800 mb-2">Interests</h2>
       {interests.map((val, i) => (
         <input key={i} value={val} placeholder="Interest" onChange={e => updateSimpleArray(interests, setInterests, i, e.target.value)} className="w-full mb-2 p-2 rounded border" />
       ))}
       <button onClick={() => setInterests([...interests, ""])} className={glowBtn}><FiPlus /> Add</button>
     </div>




   </div>
 );
};




export default ResumeForm;



