import React, { useRef, useEffect, useState } from 'react';
import { FiUser, FiFileText, FiBriefcase, FiDownload, FiEdit, FiSave, FiX } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';

const StudentView = ({ student, onClose, onSave }) => {
  const modalRef = useRef();
  const pdfRef = useRef();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...student });
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (editMode) {
      fetchCourses();
    }
  }, [editMode]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/courses");
      const data = await res.json();
      if (res.ok) {
        setCourses(data);
        const selectedCourse = data.find(c => c.name === student.course);
        setBranches(selectedCourse?.branches || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleCourseChange = (e) => {
    const selectedCourse = e.target.value;
    const courseObj = courses.find(c => c.name === selectedCourse);
    setFormData(prev => ({ ...prev, course: selectedCourse, branch: '' }));
    setBranches(courseObj?.branches || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setEditMode(false);
  };

  const handlePDFDownload = () => {
    const element = pdfRef.current;
    html2pdf().set({ margin: 0.5, filename: `${student.name}-profile.pdf`, html2canvas: { scale: 2 } }).from(element).save();
  };

  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm bg-black/30 flex items-center justify-center px-4">
      <div
        ref={modalRef}
        className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 shadow-2xl overflow-y-auto max-h-[90vh] animate-fade-in"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center w-full">Student Profile</h2>
          <div className="absolute right-4 top-4 flex gap-3 items-center">
            <button onClick={handlePDFDownload} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <FiDownload /> PDF
            </button>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="text-sm text-green-600 hover:underline flex items-center gap-1">
                <FiEdit /> Edit
              </button>
            ) : (
              <>
                <button onClick={handleSave} className="text-sm text-green-600 hover:underline flex items-center gap-1">
                  <FiSave /> Save
                </button>
                <button onClick={() => { setEditMode(false); setFormData({ ...student }); }} className="text-sm text-red-600 hover:underline flex items-center gap-1">
                  <FiX /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div ref={pdfRef} className="space-y-6">
          {/* Student Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <FiUser /> Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">

              {/* Read-only Fields */}
              <div><label>Name:</label><p>{student.name}</p></div>
              <div><label>Email:</label><p>{student.email}</p></div>
              <div><label>Phone:</label><p>{student.phone}</p></div>
              <div><label>Gap Years:</label><p>{student.gapYears}</p></div>
              <div><label>10th %:</label><p>{student.tenthPercent}</p></div>
              <div><label>12th %:</label><p>{student.twelfthPercent}</p></div>

              {/* Editable Fields */}
              <div>
                <label>Course:</label>
                {editMode ? (
                  <select name="course" value={formData.course} onChange={handleCourseChange} className="w-full px-2 py-1 rounded border dark:bg-gray-800">
                    <option value="">Select course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course.name}>{course.name}</option>
                    ))}
                  </select>
                ) : (
                  <p>{student.course}</p>
                )}
              </div>

              <div>
                <label>Branch:</label>
                {editMode ? (
                  <select name="branch" value={formData.branch} onChange={handleChange} className="w-full px-2 py-1 rounded border dark:bg-gray-800">
                    <option value="">Select branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                ) : (
                  <p>{student.branch}</p>
                )}
              </div>

              <div>
                <label>Semester:</label>
                {editMode ? (
                  <input type="number" name="semester" value={formData.semester} onChange={handleChange} className="w-full px-2 py-1 rounded border dark:bg-gray-800" />
                ) : (
                  <p>{student.semester}</p>
                )}
              </div>

              <div>
                <label>CGPA:</label>
                {editMode ? (
                  <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full px-2 py-1 rounded border dark:bg-gray-800" />
                ) : (
                  <p>{student.cgpa}</p>
                )}
              </div>

              <div>
                <label>Backlogs:</label>
                {editMode ? (
                  <input type="number" name="backlogs" value={formData.backlogs} onChange={handleChange} className="w-full px-2 py-1 rounded border dark:bg-gray-800" />
                ) : (
                  <p>{student.backlogs}</p>
                )}
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="space-y-2 text-sm">
            {student.resumeLink && (
              <p><strong>Resume:</strong> <button onClick={() => window.open(`https://jobportal-xqgm.onrender.com${student.resumeLink}`, '_blank')} className="text-blue-500 underline">View</button></p>
            )}
            {student.tenthMarksheet && (
              <p><strong>10th Marksheet:</strong> <button onClick={() => window.open(`https://jobportal-xqgm.onrender.com${student.tenthMarksheet}`, '_blank')} className="text-blue-500 underline">View</button></p>
            )}
            {student.twelfthMarksheet && (
              <p><strong>12th Marksheet:</strong> <button onClick={() => window.open(`https://jobportal-xqgm.onrender.com${student.twelfthMarksheet}`, '_blank')} className="text-blue-500 underline">View</button></p>
            )}
          </div>

          {/* Job Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <FiBriefcase /> Job Applications
            </h3>

            {student.eligibleJobs?.some(job => job.applied) && (
              <div className="mb-4">
                <p className="font-medium text-green-600 mb-1">Applied:</p>
                <ul className="list-disc list-inside text-sm ml-2 space-y-1">
                  {student.eligibleJobs.filter(job => job.applied).map(job => (
                    <li key={job._id}>
                      <span className="font-semibold">{job.title}</span>
                      <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        Eligible & Applied
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {student.eligibleJobs?.some(job => !job.applied) && (
              <div className="mb-4">
                <p className="font-medium text-yellow-600 mb-1">Not Applied:</p>
                <ul className="list-disc list-inside text-sm ml-2 space-y-1">
                  {student.eligibleJobs.filter(job => !job.applied).map(job => (
                    <li key={job._id}>
                      <span className="font-semibold">{job.title}</span>
                      <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        Eligible & Not Applied
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {student.ineligibleJobs?.length > 0 && (
              <div>
                <p className="font-medium text-red-600 mb-1">Ineligible:</p>
                <ul className="list-disc list-inside text-sm ml-2 space-y-1">
                  {student.ineligibleJobs.map(job => (
                    <li key={job._id}>
                      <span className="font-semibold">{job.title}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        (Failing: {job.failingCriteria.join(', ')})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
