// components/StudentSettingForm.jsx
import React from "react";


const StudentSettingForm = ({ formData, onChange, onSubmit }) => {
  const glowBtn =
    "mt-4 w-full px-4 py-2 font-semibold rounded-xl bg-gradient-to-br from-green-400 to-blue-600 text-white shadow-md hover:shadow-lg active:scale-95 transition-transform duration-300";


  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-xl space-y-4"
    >
      <div>
        <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
          New Username
        </label>
        <input
          type="text"
          name="newUsername"
          value={formData.newUsername}
          onChange={onChange}
          placeholder="Enter new username"
          className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>


      <div>
        <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange}
          placeholder="Enter new password"
          className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>


      <button type="submit" className={glowBtn}>
        Save Changes
      </button>
    </form>
  );
};
export default StudentSettingForm;





