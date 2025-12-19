import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const AuthRequestTable = ({
  requests,
  onApprove,
  onReject,
  onDelete,
  onApproveSelected,
  onRejectSelected,
  onDeleteSelected,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");

  const requestsPerPage = 10;

  useEffect(() => {
    let data = [...requests];

    if (searchTerm) {
      data = data.filter((r) =>
        r.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (fieldFilter !== "all") {
      data = data.filter((r) => r.field === fieldFilter);
    }

    if (sortOrder === "latest") {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredRequests(data);
    setCurrentPage(1);
  }, [requests, searchTerm, statusFilter, fieldFilter, sortOrder]);

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  );
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const confirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => () => {
      action();
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? paginatedRequests.map((r) => r._id) : []);
  };

  const handleBulkReject = () => {
    if (!feedback.trim()) {
      toast.error("Feedback is required.");
      return;
    }
    onRejectSelected(selectedIds, feedback);
    setSelectedIds([]);
    setShowFeedbackModal(false);
    setFeedback("");
    toast.success("Rejected selected requests.");
  };

  return (
    <div className="w-full">
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Rejection Feedback
            </h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full border px-2 py-1 rounded text-sm"
              placeholder="Enter reason for rejection"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="bg-gray-300 px-4 py-1 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkReject}
                className="bg-red-600 text-white px-4 py-1 rounded text-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-sm w-full">
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-200">
              {confirmMessage}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 px-4 py-1 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="bg-red-600 text-white px-4 py-1 rounded text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name..."
          className="px-4 py-2 border rounded w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="all">All Fields</option>
          <option value="cgpa">CGPA</option>
          <option value="semester">Semester</option>
          <option value="backlogs">Backlogs</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {selectedIds.length > 0 && (() => {
          const selectedRequests = requests.filter((r) => selectedIds.includes(r._id));
          const allPending = selectedRequests.every((r) => r.status === "pending");

          return (
            <>
              {allPending && (
                <>
                  <button
                    onClick={() => {
                      onApproveSelected(selectedIds);
                      setSelectedIds([]);
                      toast.success("Approved selected requests.");
                    }}
                    className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-sm"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-sm"
                  >
                    ✕ Reject
                  </button>
                </>
              )}
              <button
                onClick={() =>
                  confirm("Delete selected requests?", () => {
                    onDeleteSelected(selectedIds);
                    setSelectedIds([]);
                    toast.success("Deleted selected requests.");
                  })
                }
                className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-sm"
              >
                🗑️ Delete
              </button>
            </>
          );
        })()}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    paginatedRequests.length > 0 &&
                    paginatedRequests.every((r) => selectedIds.includes(r._id))
                  }
                />
              </th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Field</th>
              <th className="px-4 py-2 text-left">Requested Value</th>
              <th className="px-4 py-2 text-left">Evidence</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedRequests.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r._id)}
                    onChange={() => handleCheckboxChange(r._id)}
                  />
                </td>
                <td>{r.student?.user?.name || "N/A"}</td>
                <td>{r.student?.user?.email || "N/A"}</td>
                <td className="capitalize">{r.field}</td>
                <td>{r.newValue}</td>
                <td>
                  {r.proof ? (
                    <a
                      href={`https://jobportal-xqgm.onrender.com/${r.proof}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not uploaded</span>
                  )}
                </td>
                <td className="capitalize">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="space-x-1">
                  {r.status === "pending" ? (
                    <>
                      <button
                        onClick={() => {
                          onApprove(r._id);
                          toast.success("Approved request.");
                        }}
                        className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const fb = prompt("Enter rejection feedback:");
                          if (fb) {
                            onReject(r._id, fb);
                            toast.success("Rejected request.");
                          }
                        }}
                        className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-sm"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        confirm("Delete this request?", () => {
                          onDelete(r._id);
                          toast.success("Deleted request.");
                        })
                      }
                      className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-sm"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded border text-sm ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuthRequestTable;
