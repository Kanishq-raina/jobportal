import React, { useState, useEffect } from "react";
import { FaClipboardCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const StudentAuthStatus = ({ requests }) => {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [localRequests, setLocalRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  useEffect(() => {
    if (filter === "all") setFilteredRequests(localRequests);
    else setFilteredRequests(localRequests.filter((req) => req.status === filter));
  }, [filter, localRequests]);

  const handleCancel = async (id) => {
    const confirm = window.confirm("Are you sure you want to cancel this request?");
    if (!confirm) return;

    const token = localStorage.getItem("studentToken");
    try {
      const res = await fetch(`http://localhost:5000/api/student/authrequests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Request cancelled");
        setLocalRequests((prev) => prev.filter((r) => r._id !== id));
      } else {
        toast.error("Failed to cancel request");
      }
    } catch  {
      toast.error("Error cancelling request");
    }
  };

  const getDaysLeft = (createdAt) => {
    const msLeft = new Date(createdAt).getTime() + 3 * 86400000 - Date.now();
    const daysLeft = Math.ceil(msLeft / 86400000);
    return daysLeft > 0 ? `${daysLeft} day(s)` : "Expired";
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <FaClipboardCheck className="text-blue-600" />
        Verification Request Status
      </h1>

      <p className="text-sm text-gray-500 mb-2">
        * Requests older than 3 days are automatically removed.
      </p>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {["all", "approved", "pending", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1 rounded-full border font-medium transition ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <p>No requests {filter !== "all" ? `with status "${filter}"` : "submitted yet"}.</p>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isExpired =
              new Date(req.createdAt).getTime() + 3 * 86400000 < Date.now();

            return (
              <div
                key={req._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>{req.field.toUpperCase()}</strong> → {req.newValue}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        req.status === "approved"
                          ? "text-green-600"
                          : req.status === "rejected"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {isExpired
                      ? "Expired"
                      : `Expires in ${getDaysLeft(req.createdAt)}`}
                  </p>

                  {req.status === "rejected" && req.remarks && (
                    <p className="text-sm text-red-500 mt-1">
                      Reason: {req.remarks}
                    </p>
                  )}

                  {(req.status === "rejected" || isExpired) && (
                    <p className="text-xs text-blue-500 mt-1">
                      You can{" "}
                      <span
                        className="underline cursor-pointer"
                        onClick={() => navigate("/student/profile")}
                      >
                        resubmit this request
                      </span>
                      .
                    </p>
                  )}
                </div>

                <div className="flex gap-3 items-center">
                  {req.proof && (
                    <a
                      href={`http://localhost:5000/${req.proof}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Proof
                    </a>
                  )}

                  {req.status === "pending" && !isExpired && (
                    <button
                      className="text-red-500 text-sm hover:underline"
                      onClick={() => handleCancel(req._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default StudentAuthStatus;
