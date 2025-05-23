import React, { useState, useRef, useEffect } from "react";


const JobCard = ({ job, onApply, isEligible, ineligibleReasons }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const modalRef = useRef();
  const fullDescRef = useRef();
  const isDeadlinePassed = new Date(job.deadline) < new Date();


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDetails && modalRef.current && !modalRef.current.contains(e.target)) {
        setShowDetails(false);
      }
      if (showFullDescription && fullDescRef.current && !fullDescRef.current.contains(e.target)) {
        setShowFullDescription(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDetails, showFullDescription]);


  const renderCriteria = (label, ok) => (
    <p className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-red-500"}`}>
      <span className="text-lg">{ok ? "✅" : "❌"}</span>
      <span>{label}</span>
    </p>
  );


  const getRoundLabel = (rounds, jobStatus) => {
    if (!rounds) return "Job in Progress";


    if (
      rounds.final === "rejected" ||
      rounds.hr === "rejected" ||
      rounds.technical === "rejected" ||
      rounds.coding === "rejected" ||
      rounds.oa === "rejected"
    ) {
      return "❌ Rejected";
    }


    if (rounds.final === "selected") {
      return jobStatus === "taken" ? "✅ Accepted" : "Selected for: Final Selection";
    }
    if (rounds.hr === "selected") return "Selected for: HR Interview";
    if (rounds.technical === "selected") return "Selected for: Technical Interview";
    if (rounds.coding === "selected") return "Selected for: Coding Round";
    if (rounds.oa === "selected") return "Selected for: OA Round";


    return "Job in Progress";
  };


  return (
    <>
      <div
        className="bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-800 dark:to-gray-900
        shadow-xl rounded-xl p-6 border border-gray-300 dark:border-gray-700
        transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <img
            src={job.logo ? `https://jobportal-xqgm.onrender.com${job.logo}` : "/default-logo.png"}
            alt={`${job.title} logo`}
            className="w-16 h-16 object-cover rounded-full border border-gray-400"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{job.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{job.company}</p>
          </div>
        </div>


        <p className="text-sm mb-1"><strong>Salary:</strong> ₹{job.salary}</p>
        <p className="text-sm mb-1"><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>


        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">
          {job.description}
        </div>


        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setShowDetails(true)}
            className="text-blue-700 underline hover:text-blue-900 text-sm"
          >
            View Details
          </button>


          {job.applied ? (
            <div className="flex flex-col items-end">
              <span className="text-green-600 font-semibold text-sm">Applied</span>
              <span
                className={`mt-1 text-xs font-medium px-2 py-1 rounded-full ${
                  getRoundLabel(job.rounds, job.status) === "Job in Progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {getRoundLabel(job.rounds, job.status)}
              </span>
            </div>
          ) : (
            <button
              onClick={onApply}
              disabled={!isEligible || isDeadlinePassed}
              className={`px-4 py-2 rounded text-sm ${
                job.applied
                  ? "bg-green-500 cursor-not-allowed"
                  : isDeadlinePassed
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : isEligible
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              {job.applied
                ? "Applied"
                : isDeadlinePassed
                ? "Closed"
                : isEligible
                ? "Apply"
                : "Not Eligible"}
            </button>
          )}
        </div>
      </div>


      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center p-4">
          <div
            ref={modalRef}
            className="bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-800 dark:to-gray-900
            shadow-xl rounded-xl p-6 border border-gray-300 dark:border-gray-700
            w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={job.logo ? `https://jobportal-xqgm.onrender.com${job.logo}` : "/default-logo.png"}
                alt={`${job.title} logo`}
                className="w-16 h-16 object-cover rounded-full border border-gray-400"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{job.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{job.company}</p>
              </div>
            </div>


            <p className="text-sm mb-1"><strong>Salary:</strong> ₹{job.salary}</p>
            <p className="text-sm mb-3"><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>


            <div className="mb-6">
              <button
                onClick={() => setShowFullDescription(true)}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                View Full Description
              </button>
            </div>


            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700 text-sm mb-4 space-y-2">
              <h4 className="font-semibold text-base mb-2">Eligibility Criteria</h4>
              {renderCriteria(`Required CGPA: ${job.eligibility?.minCGPA ?? "N/A"}`, ineligibleReasons?.cgpaOk)}
              {renderCriteria(`Allowed Semesters: ${job.eligibility?.semestersAllowed?.join(", ")}`, ineligibleReasons?.semOk)}
              {renderCriteria(`Max Backlogs: ${job.eligibility?.maxBacklogs ?? "0"}`, ineligibleReasons?.backlogOk)}
              {renderCriteria(`Allowed Gap Years: ${job.eligibility?.allowedGapYears ?? "0"}`, ineligibleReasons?.gapOk)}
              {renderCriteria(`10th % Required: ${job.eligibility?.minTenthPercent ?? "N/A"}`, ineligibleReasons?.tenthOk)}
              {renderCriteria(`12th % Required: ${job.eligibility?.minTwelfthPercent ?? "N/A"}`, ineligibleReasons?.twelfthOk)}
              {renderCriteria(`Allowed Branches`, ineligibleReasons?.branchOk)}
              {renderCriteria(`Allowed Courses`, ineligibleReasons?.courseOk)}
            </div>


            <div className="flex justify-between items-center mt-4">
              {job.applied ? (
                <div className="flex flex-col items-start">
                  <span className="text-green-600 font-semibold text-sm">Already Applied</span>
                  <span
                    className={`mt-1 text-xs font-medium px-2 py-1 rounded-full ${
                      getRoundLabel(job.rounds, job.status) === "Job in Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {getRoundLabel(job.rounds, job.status)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onApply}
                  disabled={!isEligible || isDeadlinePassed}
                  className={`px-4 py-2 rounded text-sm ${
                    isEligible && !isDeadlinePassed
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  {job.applied
                    ? "Applied"
                    : isDeadlinePassed
                    ? "Closed"
                    : !isEligible
                    ? "Not Eligible"
                    : "Apply"}
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:underline ml-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Full Description Modal */}
      {showFullDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center p-6">
          <div
            ref={fullDescRef}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xl rounded-xl max-w-3xl w-full max-h-[90vh] p-6 overflow-y-auto border"
          >
            <h2 className="text-xl font-bold mb-4">Full Job Description</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowFullDescription(false)}
                className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default JobCard;





