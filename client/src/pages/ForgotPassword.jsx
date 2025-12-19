import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";


const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }), // ✅ match backend
      });


      const data = await res.json();


      if (res.ok) {
        toast.success("Reset link sent to your registered email.");
        setIdentifier("");
      } else {
        toast.error(data.message || "Failed to send reset link");
      }
    } catch {
      toast.error("Server error");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Toaster />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};


export default ForgotPassword;





