import React, { useState } from "react";
import { toast } from "react-hot-toast";

const MailBox = ({ recipients }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendMail = async () => {
    if (!recipients.length) return toast.error("No recipients selected");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/admin/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipients, subject, body }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Emails sent!");
        setSubject("");
        setBody("");
      } else {
        toast.error(data.message || "Failed to send mail");
      }
    } catch (err) {
      toast.error("Server error");
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mt-6 space-y-4 max-w-3xl">
      <h2 className="text-xl font-bold">Send Email</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Sending to: <strong>{recipients.join(", ") || "None"}</strong>
      </p>

      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
      />
      <textarea
        placeholder="Body"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
      />
      <button
        onClick={sendMail}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send Mail
      </button>
    </div>
  );
};

export default MailBox;
