import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";


const AdminJobCard = ({ job, onEdit, onDelete, onViewApplicants }) => {
  if (!job) return null;


  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Live </span>;
      case "inactive":
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Job In Process</span>;
      case "taken":
        return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Completed</span>;
      default:
        return null;
    }
  };


  return (
    <div
      className="relative bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-800 dark:to-gray-900
      shadow-xl rounded-xl p-6 border border-gray-300 dark:border-gray-700
      transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Action Icons */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 transition"
          title="Edit Job"
        >
          <FiEdit2 size={18} />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 transition"
          title="Delete Job"
        >
          <FiTrash2 size={18} />
        </button>
      </div>


      {/* Job Header */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={job.logo ? `http://localhost:5000${job.logo}` : "/default-logo.png"}
          alt={`${job.title} logo`}
          className="w-16 h-16 object-cover rounded-full border border-gray-400"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{job.title}</h2>
          {getStatusBadge(job.status)}
        </div>
      </div>


      {/* Job Details */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">💰 Salary: ₹{job.salary} LPA</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">👥 Vacancy: {job.vacancy}</p>


      <button
        onClick={onViewApplicants}
        className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
      >
        View Applicants
      </button>
    </div>
  );
};


export default AdminJobCard;



