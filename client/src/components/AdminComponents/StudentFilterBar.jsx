import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentFilterBar = ({ filters, setFilters }) => {
  const [courseBranchMap, setCourseBranchMap] = useState({});
  const [courses, setCourses] = useState([]);

  // Fetch courses and branches from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('https://jobportal-xqgm.onrender.com/api/courses'); // Adjust path if needed
        const map = {};
        res.data.forEach(course => {
          map[course.name] = course.branches;
        });
        setCourseBranchMap(map);
        setCourses(Object.keys(map));
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Handle change for inputs and dropdowns
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "course" ? { branch: "" } : {}) // Reset branch if course changes
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      name: '',
      email: '',
      minCgpa: '',
      maxCgpa: '',
      minBacklogs: '',
      maxBacklogs: '',
      minSemester: '',
      maxSemester: '',
      branch: '',
      course: '',
      sortBy: '',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {/* Name */}
      <input
        type="text"
        placeholder="Search Name"
        value={filters.name}
        onChange={(e) => handleChange('name', e.target.value)}
        className="input input-bordered"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Search Email"
        value={filters.email}
        onChange={(e) => handleChange('email', e.target.value)}
        className="input input-bordered"
      />

      {/* CGPA */}
      <input
        type="number"
        step="0.1"
        placeholder="Min CGPA"
        value={filters.minCgpa}
        onChange={(e) => handleChange('minCgpa', e.target.value)}
        className="input input-bordered"
      />
      <input
        type="number"
        step="0.1"
        placeholder="Max CGPA"
        value={filters.maxCgpa}
        onChange={(e) => handleChange('maxCgpa', e.target.value)}
        className="input input-bordered"
      />

      {/* Semester */}
      <input
        type="number"
        placeholder="Min Semester"
        value={filters.minSemester}
        onChange={(e) => handleChange('minSemester', e.target.value)}
        className="input input-bordered"
      />
      <input
        type="number"
        placeholder="Max Semester"
        value={filters.maxSemester}
        onChange={(e) => handleChange('maxSemester', e.target.value)}
        className="input input-bordered"
      />

      {/* Backlogs */}
      <input
        type="number"
        placeholder="Min Backlogs"
        value={filters.minBacklogs}
        onChange={(e) => handleChange('minBacklogs', e.target.value)}
        className="input input-bordered"
      />
      <input
        type="number"
        placeholder="Max Backlogs"
        value={filters.maxBacklogs}
        onChange={(e) => handleChange('maxBacklogs', e.target.value)}
        className="input input-bordered"
      />

      {/* Course Dropdown */}
      <select
        value={filters.course}
        onChange={(e) => handleChange('course', e.target.value)}
        className="input input-bordered"
      >
        <option value="">Select Course</option>
        {courses.map((course) => (
          <option key={course} value={course}>{course}</option>
        ))}
      </select>

      {/* Branch Dropdown */}
      <select
        value={filters.branch}
        onChange={(e) => handleChange('branch', e.target.value)}
        disabled={!filters.course}
        className={`input input-bordered ${!filters.course ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">Select Branch</option>
        {(courseBranchMap[filters.course] || []).map((branch) => (
          <option key={branch} value={branch}>{branch}</option>
        ))}
      </select>

      {/* Sort Dropdown */}
      <select
        value={filters.sortBy}
        onChange={(e) => handleChange('sortBy', e.target.value)}
        className="input input-bordered"
      >
        <option value="">Sort By</option>
        <option value="name">Name (A-Z)</option>
        <option value="-name">Name (Z-A)</option>
        <option value="cgpa">CGPA ↑</option>
        <option value="-cgpa">CGPA ↓</option>
        <option value="semester">Semester ↑</option>
        <option value="-semester">Semester ↓</option>
      </select>

      {/* Reset Button */}
      <button
        className="col-span-full bg-red-500 text-white rounded-xl px-4 py-2 hover:bg-red-600"
        onClick={handleReset}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default StudentFilterBar;
