import React from "react";


const EditJobModal = ({ editForm, setEditForm, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-2xl my-12 shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Job</h3>


        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Job Title</label>
            <input
              type="text"
              placeholder="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="p-2 border rounded w-full dark:bg-gray-900 dark:text-white"
              autoFocus
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Salary (LPA)</label>
            <input
              type="number"
              placeholder="Salary"
              value={editForm.salary}
              onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
              className="p-2 border rounded w-full dark:bg-gray-900 dark:text-white"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Vacancy</label>
            <input
              type="number"
              placeholder="Vacancy"
              value={editForm.vacancy}
              onChange={(e) => setEditForm({ ...editForm, vacancy: e.target.value })}
              className="p-2 border rounded w-full dark:bg-gray-900 dark:text-white"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Deadline</label>
            <input
              type="date"
              value={editForm.deadline}
              onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
              className="p-2 border rounded w-full dark:bg-gray-900 dark:text-white"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
            <textarea
              placeholder="Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows="4"
              className="p-2 border rounded w-full dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>


        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};


export default EditJobModal;





