import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const ApplyToJob = () => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const [job, setJob] = useState(null);
 
  const [loading, setLoading] = useState(true);

  const fetchJob = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/job/token/${token}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid or expired token");
        return;
      }

      setJob(data.job);
       // backend should return student info too
    } catch  {
      toast.error("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/student/apply/${job._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("studentToken")}` },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Applied successfully!");
      } else {
        toast.error(data.message || "Application failed");
      }
    } catch  {
      toast.error("Error during application");
    }
  };

  useEffect(() => {
    if (token) fetchJob();
    else toast.error("Missing token in URL");
  }, [token]);

  if (loading) return <p className="p-8">Loading...</p>;

  if (!job) return <p className="p-8 text-red-500">Job not found or token invalid.</p>;

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Toaster />
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{job.company}</p>
        <p className="mb-2"><strong>Salary:</strong> ₹{job.salary}</p>
        <p className="mb-2"><strong>Vacancy:</strong> {job.vacancy}</p>
        <p className="mb-4"><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>

        <h2 className="font-semibold mt-4 mb-2">Job Description</h2>
        <p className="whitespace-pre-wrap mb-6">{job.description}</p>

        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default ApplyToJob;
