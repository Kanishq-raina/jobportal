import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import StudentFilterBar from './StudentFilterBar';
import * as XLSX from "xlsx";
import JobRoundManager from "./JobRoundManager";

const ApplicantsModal = ({ job, onClose, onSendReminder }) => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [applicantFilter, setApplicantFilter] = useState('applied');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [excelInputKey, setExcelInputKey] = useState(Date.now());
  const [showFinalList, setShowFinalList] = useState(false);
  const [finalSelectedStudents, setFinalSelectedStudents] = useState([]);



  const [filters, setFilters] = useState({
    name: '', email: '', cgpa: '', minCgpa: '', maxCgpa: '',
    backlogs: '', minBacklogs: '', maxBacklogs: '',
    semester: '', minSemester: '', maxSemester: '',
    branch: '', sortBy: '',
  });

  const tableRef = useRef();
 const finalTableRef = useRef(); // ✅ Add this

 const fetchApplicants = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`https://jobportal-xqgm.onrender.com/api/admin/jobs/${job._id}/applicants`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error fetching applicants");
    }

    const data = await res.json();


    if (job.status === 'taken') {
      const finalSelected = data.applicants.filter((a) => a.selectedInFinalRound);
      setApplicants(finalSelected);
      setFinalSelectedStudents(finalSelected);
    } else {
      setApplicants(data.applicants);
    }

    setSelectedApplicants([]);
  } catch (error) {
    console.error(error);
    toast.error('Failed to fetch applicants');
  }
};


  useEffect(() => {
    fetchApplicants();
  }, [job]);

  const toggleSelectApplicant = (id) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const filteredApplicants = applicants
    .filter((student) => {
      if (job.status === 'inactive') return student.hasApplied === true;
      if (applicantFilter === 'applied') return student.hasApplied === true;
      if (applicantFilter === 'not_applied') return student.hasApplied === false;
      return true;
    })
    .filter((student) => {
      const matchesName = student.name?.toLowerCase().includes(filters.name.toLowerCase()) ?? false;
      const matchesEmail = student.email?.toLowerCase().includes(filters.email.toLowerCase()) ?? false;

      const cgpa = parseFloat(student.cgpa) || 0;
      const minCgpa = parseFloat(filters.minCgpa) || 0;
      const maxCgpa = parseFloat(filters.maxCgpa) || 10;

      const semester = parseInt(student.semester) || 1;
      const minSemester = parseInt(filters.minSemester) || 1;
      const maxSemester = parseInt(filters.maxSemester) || 10;
      const backlogs = parseInt(student.backlogs) || 0;
      const minBacklogs = parseInt(filters.minBacklogs) || 0;
      const maxBacklogs = parseInt(filters.maxBacklogs) || 50;

      const matchesCgpa = cgpa >= minCgpa && cgpa <= maxCgpa;
      const matchesSemester = semester >= minSemester && semester <= maxSemester;
      const matchesBranch = filters.branch ? student.branch === filters.branch : true;
      const matchesBacklogs = backlogs >= minBacklogs && backlogs <= maxBacklogs;

      return matchesName && matchesEmail && matchesCgpa && matchesSemester && matchesBranch && matchesBacklogs;
    }).sort((a, b) => {
      if (filters.sortBy === 'cgpa') return (b.cgpa || 0) - (a.cgpa || 0);
      if (filters.sortBy === 'name') return (a.name || "").localeCompare(b.name || "");
      if (filters.sortBy === 'semester') return (a.semester || 0) - (b.semester || 0);
      return 0;
    });

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setApplicants((prev) => {
        const updated = [...prev];
        jsonData.forEach((incoming) => {
          const index = updated.findIndex((a) => a.email === incoming.email);
          if (index !== -1) {
            updated[index] = { ...updated[index], ...incoming };
          } else {
            updated.push(incoming);
          }
        });
        return updated;
      });

      toast.success("Excel imported successfully!");
    } catch (err) {
      console.error("❌ Import failed:", err);
      toast.error("Failed to import Excel");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[95%] max-w-6xl my-12">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Applicants for {job.title}
        </h3>

        <StudentFilterBar filters={filters} setFilters={setFilters} />

      {job.status !== 'taken' && (
  <div className="flex gap-2 mb-4">
    {job.status === 'inactive' ? (
      <button
        className={`px-3 py-1 rounded ${applicantFilter === 'applied' ? 'bg-blue-600 text-white' : 'bg-blue-200 dark:bg-gray-600'}`}
        onClick={() => setApplicantFilter('applied')}
      >
        Applied
      </button>
    ) : (
      ['applied', 'not_applied'].map((status) => (
        <button
          key={status}
          className={`px-3 py-1 rounded ${applicantFilter === status ? 'bg-blue-600 text-white' : 'bg-blue-200 dark:bg-gray-600'}`}
          onClick={() => setApplicantFilter(status)}
        >
          {status === 'applied' ? 'Applied' : 'Not Applied'}
        </button>
      ))
    )}
  </div>
)}


       <div className="flex flex-wrap gap-2 mb-4">
  {job.status !== 'taken' && (
    <>
      <button
        onClick={() => setSelectedApplicants(filteredApplicants.map((a) => a._id))}
        className="px-4 py-2 bg-gray-500 text-white rounded"
      >
        Select All
      </button>

      <DownloadTableExcel
        filename="Applicants"
        sheet="Sheet"
        currentTableRef={tableRef.current}
      >
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Export Excel
        </button>
      </DownloadTableExcel>
    </>
  )}

 {job.status === 'inactive' && (
  <div className="w-full flex justify-start mt-2">
    <JobRoundManager jobId={job._id} />
  </div>
)}


  {job.status === 'active' && applicantFilter === 'not_applied' && filteredApplicants.length > 0 && (
    <button
      onClick={() => {
        const selectedStudents = applicants.filter(
          (s) => selectedApplicants.includes(s._id) && !s.hasApplied
        );
        const toSend = selectedStudents.length > 0 ? selectedStudents : filteredApplicants;
        onSendReminder?.(toSend);
      }}
      className="px-4 py-2 bg-indigo-600 text-white rounded"
    >
      Send Reminder
    </button>
  )}

  {job.status === 'taken' && (
    <>
      <DownloadTableExcel
  filename={`Final_Selected_Students_${job.title}`}
  sheet="FinalSelected"
  currentTableRef={finalTableRef.current}
>
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Export Final List
        </button>
      </DownloadTableExcel>

      <button
        onClick={() => setShowFinalList(!showFinalList)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {showFinalList ? "Hide Final List" : "View Final List"}
      </button>
    </>
  )}
</div>

{job.status !== 'taken' && (
        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full text-sm text-gray-800 dark:text-gray-300">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="p-2">Select</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">CGPA</th>
                <th className="p-2">Branch</th>
                <th className="p-2">Semester</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((student) => (
                <tr
                  key={student._id}
                  className="border-b dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.includes(student._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectApplicant(student._id);
                      }}
                    />
                  </td>
                  <td className="p-2">{student.name || "N/A"}</td>
                  <td className="p-2">{student.email || "N/A"}</td>
                  <td className="p-2">{student.phone || "N/A"}</td>
                  <td className="p-2">{student.cgpa !== null ? student.cgpa : "N/A"}</td>
                  <td className="p-2">{student.branch || "N/A"}</td>
                  <td className="p-2">{student.semester || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
)}
        {showFinalList && job.status === 'taken' && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Final Round Selected Students
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-800 dark:text-gray-300 border">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Course</th>
                    <th className="p-2 border">Branch</th>
                    <th className="p-2 border">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {finalSelectedStudents.length > 0 ? (
                    finalSelectedStudents.map((s) => (
                      <tr key={s._id} className="border-b dark:border-gray-600">
                        <td className="p-2 border">{s.name || 'N/A'}</td>
                        <td className="p-2 border">{s.email || 'N/A'}</td>
                        <td className="p-2 border">{s.course || 'N/A'}</td>
                        <td className="p-2 border">{s.branch || 'N/A'}</td>
                        <td className="p-2 border">{s.semester || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-gray-500">
                        No final round selections yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">
            Close
          </button>
        </div>

        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                {selectedStudent.name}'s Details
              </h2>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Email:</strong> {selectedStudent.email}</li>
                <li><strong>Phone:</strong> {selectedStudent.phone}</li>
                <li><strong>CGPA:</strong> {selectedStudent.cgpa}</li>
                <li><strong>Branch:</strong> {selectedStudent.branch}</li>
                <li><strong>Semester:</strong> {selectedStudent.semester}</li>
                {selectedStudent.resume && (
                  <li>
                    <strong>Resume:</strong>{' '}
                    <a href={selectedStudent.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      View Resume
                    </a>
                  </li>
                )}
              </ul>
              <div className="flex justify-end mt-4">
                <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-gray-600 text-white rounded">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ✅ Hidden clean export-only table for Final List Excel */}
<table ref={finalTableRef} className="hidden">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Course</th>
      <th>Branch</th>
      <th>Semester</th>
      <th>CGPA</th>
    </tr>
  </thead>
  <tbody>
    {finalSelectedStudents.map((s) => (
      <tr key={s._id}>
        <td>{s.name || 'N/A'}</td>
        <td>{s.email || 'N/A'}</td>
        <td>{s.course || 'N/A'}</td>
        <td>{s.branch || 'N/A'}</td>
        <td>{s.semester || 'N/A'}</td>
        <td>{s.cgpa !== null ? s.cgpa : 'N/A'}</td>
      </tr>
    ))}
  </tbody>
</table>
{/* ✅ Hidden export-only table without the "Select" column */}
<table ref={tableRef} className="hidden">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      <th>CGPA</th>
      <th>Branch</th>
      <th>Semester</th>
    </tr>
  </thead>
  <tbody>
    {filteredApplicants.map((s) => (
      <tr key={s._id}>
        <td>{s.name || 'N/A'}</td>
        <td>{s.email || 'N/A'}</td>
        <td>{s.phone || 'N/A'}</td>
        <td>{s.cgpa !== null ? s.cgpa : 'N/A'}</td>
        <td>{s.branch || 'N/A'}</td>
        <td>{s.semester || 'N/A'}</td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
};

export default ApplicantsModal;
