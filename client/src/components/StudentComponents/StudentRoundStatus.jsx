import React from "react";

const roundLabels = {
  oa: "OA",
  coding: "Coding",
  technical: "Technical",
  hr: "HR",
  final: "Final",
};

const StudentRoundStatus = ({ roundStatus = {} }) => {
  const renderBadge = (status) => {
    switch (status) {
      case "selected":
        return <span className="text-green-600 font-semibold">✅ Selected</span>;
      case "rejected":
        return <span className="text-red-500 font-semibold">❌ Rejected</span>;
      case "pending":
      default:
        return <span className="text-yellow-500 font-semibold">⏳ Pending</span>;
    }
  };

  return (
    <div className="space-y-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-2">Your Round Progress</h3>
      {Object.keys(roundLabels).map((round) => (
        <div key={round} className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {roundLabels[round]} Round:
          </span>
          {renderBadge(roundStatus?.[round] || "pending")}
        </div>
      ))}
    </div>
  );
};

export default StudentRoundStatus;
