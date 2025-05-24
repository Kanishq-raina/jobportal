import React, { useState, useEffect } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import TopNav from "../../components/AdminComponents/TopNav";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import clsx from "clsx";
import axios from "axios";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobList, setJobList] = useState([]);
  const [jobAppStats, setJobAppStats] = useState(null);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("https://jobportal-xqgm.onrender.com/api/admin/dashboard-metrics");
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

const fetchJobs = async () => {
  try {
    const res = await axios.get("https://jobportal-xqgm.onrender.com/api/job");

    const activeJobs = res.data.filter((job) => job.status === "active");
    setJobList(activeJobs);

    if (activeJobs.length > 0 && activeJobs[0]._id) {
      setSelectedJobId(activeJobs[0]._id.toString()); // set first active job
    } else {
      console.warn("⚠️ No active jobs found or invalid _id");
    }
  } catch (err) {
    console.error("Error fetching jobs:", err);
  }
};


    fetchDashboardData();
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchAppStats = async () => {
      if (selectedJobId) {
        const res = await axios.get(`https://jobportal-xqgm.onrender.com/api/job/applicants/${selectedJobId}`);
        setJobAppStats(res.data.stats);
      }
    };
    fetchAppStats();
  }, [selectedJobId]);

  const stats = {
    totalJobs: dashboardData?.totalJobs || 0,
    activeJobs: dashboardData?.activeJobs || 0,
    students: dashboardData?.totalStudents || 0,
    applications: dashboardData?.studentsApplied || 0,
    selected: dashboardData?.studentsSelected || 0,
  };

  const jobsStatus = [
    { name: "Active", value: dashboardData?.activeJobs || 0 },
    { name: "Completed", value: dashboardData?.completedJobs || 0 },
    { name: "In Progress", value: dashboardData?.inProgressJobs || 0 },
  ];

  const applicationsMonthly = jobAppStats
    ? [
        { month: "Applied", applications: jobAppStats.studentsApplied },
        { month: "Not Applied", applications: jobAppStats.studentsNotApplied },
      ]
    : [];

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className={clsx(
          "flex flex-col flex-1 transition-all duration-300",
          isCollapsed ? "ml-20" : "ml-24"
        )}
      >
        <TopNav toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />

        <main className="mt-[72px] px-6 py-4">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
            Admin Dashboard
          </h2>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {[
              { label: "Total Jobs", value: stats.totalJobs, color: "text-green-500" },
              { label: "Active Jobs", value: stats.activeJobs, color: "text-blue-500" },
              { label: "Total Students", value: stats.students, color: "text-yellow-500" },
              { label: "Applications", value: stats.applications, color: "text-red-500" },
              { label: "Students Selected Jobs", value: stats.selected, color: "text-emerald-500" },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl shadow-xl hover:scale-[1.03] transform transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-600">{item.label}</h3>
                <p className={`text-4xl font-extrabold mt-4 ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Graphs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-700 mb-6">Job Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobsStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {jobsStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Select Job
                </label>
                <select
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  value={selectedJobId || ""}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  {jobList.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <h3 className="text-xl font-bold text-gray-700 mb-6">Application Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationsMonthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar
                    dataKey="applications"
                    fill="#3b82f6"
                    radius={[10, 10, 0, 0]}
                    isAnimationActive
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
