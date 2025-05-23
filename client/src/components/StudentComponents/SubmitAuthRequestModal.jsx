import React, { useState } from "react";
import { toast } from "react-hot-toast";

const SubmitAuthRequestModal = ({ field, onClose, refetchProfile }) => {
  const [requestedValue, setRequestedValue] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    if (!requestedValue || !file) {
      toast.error("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("field", field);
    formData.append("newValue", requestedValue);
    formData.append("proof", file);

    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/student/authrequest", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Request submitted!");
        refetchProfile(); // optional
        onClose();
      } else {
        toast.error(data.message || "Failed to submit request");
      }
    } catch (err) {
      console.error("Auth request error:", err);
      toast.error("Server error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl text-gray-600 hover:text-red-600">
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Request Update: {field}</h2>

        <label className="block mb-2">
          New Value
          <input
            type="text"
            value={requestedValue}
            onChange={(e) => setRequestedValue(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 mt-1"
            placeholder={`Enter updated ${field}`}
          />
        </label>

        <label className="block mb-4">
          Upload Evidence (screenshot/pdf)
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-2 text-sm"
          />
        </label>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
};

export default SubmitAuthRequestModal;
