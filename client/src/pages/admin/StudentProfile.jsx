import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/AdminComponents/Sidebar';
import TopNav from '../../components/AdminComponents/TopNav';
import { FiUser, FiMail, FiPhone, FiLayers, FiHash, FiBookOpen } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';

const StudentProfile = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [student, setStudent] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`https://jobportal-xqgm.onrender.com/api/admin/students/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) setStudent(data);
      } catch (err) {
        console.error('Error fetching student:', err);
      }
    };
    fetchStudent();
  }, [id]);

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} />
        <Toaster />
        <main className="p-6 text-gray-800 dark:text-white">
          <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

          {student ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-3xl space-y-4">
              <InfoRow icon={<FiUser />} label="Name" value={student.name} />
              <InfoRow icon={<FiMail />} label="Email" value={student.email} />
              <InfoRow icon={<FiPhone />} label="Phone" value={student.phone || 'Not set'} />
              <InfoRow icon={<FiLayers />} label="Branch" value={student.branch} />
              <InfoRow icon={<FiHash />} label="CGPA" value={student.cgpa} />
              <InfoRow icon={<FiBookOpen />} label="Semester" value={student.semester} />
              <InfoRow label="Backlogs" value={student.backlogs || 0} />
              <InfoRow label="Gap Years" value={student.gapYears || 0} />
              <InfoRow label="GitHub" value={student.github || 'Not set'} />
              <InfoRow label="LinkedIn" value={student.linkedin || 'Not set'} />
            </div>
          ) : (
            <p>Loading student info...</p>
          )}
        </main>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    {icon && <span className="text-blue-600">{icon}</span>}
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  </div>
);

export default StudentProfile;
