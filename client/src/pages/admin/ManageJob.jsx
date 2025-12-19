import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminComponents/Sidebar';
import TopNav from '../../components/AdminComponents/TopNav';
import AdminJobCard from '../../components/AdminComponents/AdminJobCard';
import ApplicantsModal from '../../components/AdminComponents/ApplicantsModal';
import EditJobModal from '../../components/AdminComponents/EditJobModal';
import { Toaster, toast } from 'react-hot-toast';
import clsx from 'clsx';


const ManageJob = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingApplicants, setViewingApplicants] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    salary: '',
    vacancy: '',
    deadline: '',
    description: '',
  });


  const toggleSidebar = () => setIsCollapsed(!isCollapsed);


  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('https://jobportal-xqgm.onrender.com/api/admin/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();


      const now = new Date();
      const updatedJobs = await Promise.all(
        data.map(async (job) => {
          if (job.status === 'active' && new Date(job.deadline) < now) {
            await fetch(`https://jobportal-xqgm.onrender.com/api/admin/jobs/${job._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: 'inactive' }),
            });
            return { ...job, status: 'inactive' };
          }
          return job;
        })
      );


      setJobs(updatedJobs);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchJobs();
  }, []);


  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://jobportal-xqgm.onrender.com/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });


      if (res.ok) {
        toast.success('Job deleted successfully');
        fetchJobs();
      } else {
        toast.error('Failed to delete job');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting job');
    }
  };


  const deleteSelectedJobs = async () => {
    if (!window.confirm("Are you sure you want to delete the selected jobs?")) return;


    try {
      const token = localStorage.getItem("adminToken");


      for (const jobId of selectedJobIds) {
        await fetch(`https://jobportal-xqgm.onrender.com/api/admin/jobs/${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }


      toast.success("Selected jobs deleted.");
      setSelectedJobIds([]);
      fetchJobs();
    } catch (error) {
      console.error("Batch delete error:", error);
      toast.error("Failed to delete selected jobs.");
    }
  };


  const startEditJob = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      salary: job.salary,
      vacancy: job.vacancy,
      deadline: new Date(job.deadline).toISOString().split('T')[0],
      description: job.description,
    });
  };


  const submitEditJob = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://jobportal-xqgm.onrender.com/api/admin/jobs/${editingJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });


      if (res.ok) {
        toast.success('Job updated successfully');
        setEditingJob(null);
        fetchJobs();
      } else {
        toast.error('Failed to update job');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating job');
    }
  };


  const filteredJobs = jobs.filter((job) => job.status === selectedStatus);


  const handleSelectAll = (checked) => {
    if (checked) {
      const ids = filteredJobs.map(job => job._id);
      setSelectedJobIds(ids);
    } else {
      setSelectedJobIds([]);
    }
  };


  const handleToggleJobSelect = (id) => {
    setSelectedJobIds(prev =>
      prev.includes(id) ? prev.filter(jid => jid !== id) : [...prev, id]
    );
  };


  const handleSendReminder = async (students) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/admin/send-reminder-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students }),
      });


      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Reminder sent!");
      } else {
        toast.error(data.message || "Failed to send reminder.");
      }
    } catch (error) {
      console.error("Reminder error:", error);
      toast.error("Error sending reminder.");
    }
  };


  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={clsx('flex flex-col flex-1 transition-all duration-300', isCollapsed ? 'ml-20' : 'ml-24')}>
        <TopNav toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
        <main className="mt-[72px] px-6 py-10">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">Manage Jobs</h2>


          {/* Status Buttons */}
          <div className="flex gap-4 mb-8">
            {['active', 'inactive', 'taken'].map((status) => {
              const statusLabel = {
                inactive: 'Job In Process',
                taken: 'Completed Jobs',
                active: 'Live Jobs',
              }[status];


              return (
                <button
                  key={status}
                  className={`px-4 py-2 rounded text-white font-semibold ${
                    selectedStatus === status
                      ? status === 'active'
                        ? 'bg-green-600'
                        : status === 'taken'
                        ? 'bg-yellow-500'
                        : 'bg-red-600'
                      : status === 'active'
                      ? 'bg-green-400'
                      : status === 'taken'
                      ? 'bg-yellow-300'
                      : 'bg-red-400'
                  }`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {statusLabel}
                </button>
              );
            })}
          </div>


          {/* Select All + Delete for Completed Jobs */}
          {selectedStatus === "taken" && filteredJobs.length > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <input
                type="checkbox"
                checked={selectedJobIds.length === filteredJobs.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="text-gray-800 dark:text-white">Select All</span>
              <button
                onClick={deleteSelectedJobs}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete Selected
              </button>
            </div>
          )}


          {/* Job Cards */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-700 dark:text-white">Loading jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div key={job._id} className="relative">
                  {selectedStatus === "taken" && (
                    <input
                      type="checkbox"
                      checked={selectedJobIds.includes(job._id)}
                      onChange={() => handleToggleJobSelect(job._id)}
                      className="absolute top-2 left-2 z-10"
                    />
                  )}
                  <AdminJobCard
                    job={job}
                    onEdit={() => startEditJob(job)}
                    onDelete={() => deleteJob(job._id)}
                    onViewApplicants={() => setViewingApplicants(job)}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>


      {/* Modals */}
      {viewingApplicants && (
        <ApplicantsModal
          job={viewingApplicants}
          onClose={() => setViewingApplicants(null)}
          onSendReminder={handleSendReminder}
        />
      )}


      {editingJob && (
        <EditJobModal
          editForm={editForm}
          setEditForm={setEditForm}
          onClose={() => setEditingJob(null)}
          onSubmit={submitEditJob}
        />
      )}


      <Toaster />
    </div>
  );
};


export default ManageJob;





