import React, { useState } from "react";
import { useSearchParams , useNavigate} from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";



const ResetPassword = () => {
    const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful!");
        setTimeout(() => {
          navigate("/"); // Redirect to login (Home)
        }, 1500);
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Toaster />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
