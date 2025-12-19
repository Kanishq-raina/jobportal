import React, { useState, useEffect } from "react";
import clsx from "clsx";
import StudentSidebar from "../../components/StudentComponents/StudentSidebar";
import StudentTopNav from "../../components/StudentComponents/StudentTopNav";
import { toast, Toaster } from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";


// ✅ Feedback Modal Component
const FeedbackModal = ({ feedback, onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-[100px]" // Push modal down from topnav
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-4xl mx-4 p-6 max-h-[60vh] overflow-y-auto"
      >
        <h2 className="text-lg font-bold text-indigo-600 mb-4">Resume Feedback</h2>
        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {feedback}
        </pre>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mt-4 px-4 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};




const StudentDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  const [atsResults, setAtsResults] = useState([]);
  const [activeFeedback, setActiveFeedback] = useState(null); // ✅ Added for modal


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const res = await fetch("https://jobportal-xqgm.onrender.com/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });


        const data = await res.json();
        if (res.ok) {
          setStudentInfo(data);
        } else {
          toast.error(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error:", err.message);
        toast.error("Failed to load profile data");
      }
    };
    fetchProfile();
  }, []);


  const getResumeScore = async () => {
    setLoadingScore(true);
    const token = localStorage.getItem("studentToken");


    try {
      const jobRes = await fetch("https://jobportal-xqgm.onrender.com/api/student/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobs = await jobRes.json();
      const eligibleJobs = jobs;


      const results = await Promise.all(
        eligibleJobs.map(async (job) => {
          try {
            const res = await fetch(`https://jobportal-xqgm.onrender.com/api/student/resume/score/${job._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            return {
              title: job.title,
              score: data.score || 0,
              feedback: data.feedback || "No feedback available",
            };
          } catch {
            return {
              title: job.title,
              score: 0,
              feedback: "Error scoring this job",
            };
          }
        })
      );


      setAtsResults(results);
      toast.success("Resume scored for all eligible jobs.");
    } catch (err) {
      console.error(err);
      toast.error("Server error while scoring resume");
    } finally {
      setLoadingScore(false);
    }
  };


  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-3xl border-gray-300 dark:border-gray-700 p-6 md:p-8">
      <Toaster position="top-center" />
      <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />


      <div
        className={clsx(
          "flex flex-col flex-1 transition-all duration-300",
          isCollapsed ? "ml-[72px]" : "ml-24"
        )}
      >
        <StudentTopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} isCollapsed={isCollapsed} />


        <main className="mt-[72px] px-6 py-10 w-full">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
            Student Dashboard
          </h2>


          <div className="max-w-6xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8 animate-fadeIn ml-0 mr-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Section: Photo */}
              <div className="flex flex-col items-center text-center space-y-6">
                {!photoError && studentInfo?.photo ? (
                  <img
                    src={studentInfo.photo}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-4 border-blue-300 shadow"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <FaUserCircle className="text-gray-400 dark:text-gray-500 w-32 h-32" />
                )}
              </div>


              {/* Right Section: Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {studentInfo?.name || "Student Name"}
                  </h1>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {studentInfo?.course || "Course"} - {studentInfo?.branch || "Branch"}
                  </p>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <div><strong>Email:</strong> {studentInfo?.email}</div>
                  <div><strong>Phone:</strong> {studentInfo?.phone}</div>
                  <div><strong>Semester:</strong> {studentInfo?.semester}</div>
                  <div><strong>CGPA:</strong> {studentInfo?.cgpa}</div>
                  <div><strong>Backlogs:</strong> {studentInfo?.backlogs}</div>
                  <div><strong>Address:</strong> {studentInfo?.address || "Not Provided"}</div>
                </div>


                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    “Push yourself, because no one else is going to do it for you.”
                  </p>
                </div>


                {/* Resume Score Section */}
                <div className="mt-6 space-y-4">
                  <button
                    onClick={getResumeScore}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow"
                  >
                    {loadingScore ? "Scoring..." : "Get Resume Scores for Eligible Jobs"}
                  </button>


                  {atsResults.length > 0 && (
                    <div className="overflow-x-auto">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4">
                        Resume Match Results:
                      </h3>
                      <table className="min-w-full table-auto border border-gray-300 dark:border-gray-600 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-2 border">Job Title</th>
                            <th className="px-4 py-2 border">ATS Score</th>
                            <th className="px-4 py-2 border">Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {atsResults.map((res, i) => (
                            <tr key={i} className="border-t dark:border-gray-700">
                              <td className="px-4 py-2 border">{res.title}</td>
                              <td className="px-4 py-2 border font-bold text-green-600">{res.score}%</td>
                              <td className="px-4 py-2 border text-center">
                                <button
                                  onClick={() => setActiveFeedback(res.feedback)}
                                  className="text-sm text-indigo-600 hover:underline"
                                >
                                  View Feedback
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>


      {/* ✅ Feedback Modal Rendering */}
      {activeFeedback && (
        <FeedbackModal
          feedback={activeFeedback}
          onClose={() => setActiveFeedback(null)}
        />
      )}
    </div>
  );
};


export default StudentDashboard;





