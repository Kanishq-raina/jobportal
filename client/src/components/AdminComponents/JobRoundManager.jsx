import React, { useState, useEffect } from 'react';


const RoundManager = ({ jobId }) => {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [modalRound, setModalRound] = useState(null);
  const [excelInputKey, setExcelInputKey] = useState(Date.now());


  const roundTypes = ['oa', 'coding', 'technical', 'hr', 'final'];


  const fetchRounds = async () => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`http://localhost:5000/api/jobround/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRounds(data);
  };


  useEffect(() => {
    fetchRounds();
  }, []);


  const handleUpload = async (e, roundType) => {
    const file = e.target.files[0];
    if (!file) return;


    const formData = new FormData();
    formData.append("excel", file);


    const token = localStorage.getItem("adminToken");
    const res = await fetch(`http://localhost:5000/api/jobround/upload/${jobId}/${roundType}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });


    const data = await res.json();
    if (res.ok) {
      alert("Uploaded");
      fetchRounds();
      setExcelInputKey(Date.now());
    } else {
      alert("Error: " + data.message);
    }
  };


  const sendEmails = async (roundType) => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`http://localhost:5000/api/jobround/${jobId}/${roundType}/send-mails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) alert("Emails sent");
    else alert("Email failed: " + data.message);
  };


  const roundData = rounds.find(r => r.roundType === selectedRound);


  return (
    <div className="space-y-4">
      {/* Round Selection Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1 text-gray-800 dark:text-white">Select Round</label>
        <select
          className="border rounded px-4 py-2 w-full"
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
        >
          <option value="">-- Choose a Round --</option>
          {roundTypes.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)} Round</option>
          ))}
        </select>
      </div>


      {/* Round Tools Card */}
      {selectedRound && (
        <div className="rounded-xl border bg-white shadow-md p-6">
          <h2 className="text-lg font-bold capitalize mb-4">{selectedRound} Round Tools</h2>


          {/* File Upload */}
          <input
            key={excelInputKey + selectedRound}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleUpload(e, selectedRound)}
            className="mb-3"
          />


          <div className="flex gap-3 mb-4">
            <button
              onClick={() => sendEmails(selectedRound)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Send Mail to Selected
            </button>


            {roundData?.selectedStudents?.length > 0 && (
              <button
                onClick={() => setModalRound(roundData)}
                className="bg-gray-700 text-white px-4 py-2 rounded"
              >
                📄 View List
              </button>
            )}
          </div>


          {!roundData?.selectedStudents?.length && (
            <p className="text-gray-500">No students uploaded yet.</p>
          )}
        </div>
      )}


      {/* Modal for View List */}
      {modalRound && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold capitalize">
                {modalRound.roundType} Round – Selected Students
              </h2>
              <button
                onClick={() => setModalRound(null)}
                className="text-gray-600 hover:text-black"
              >
                ❌ Close
              </button>
            </div>


            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Course</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">Semester</th>
                  <th className="px-3 py-2">CGPA</th>
                </tr>
              </thead>
              <tbody>
                {modalRound.selectedStudents?.map((student, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{student.name}</td>
                    <td className="px-3 py-2">{student.email}</td>
                    <td className="px-3 py-2">{student.phone}</td>
                    <td className="px-3 py-2">{student.student?.course?.name ?? "-"}</td>
                    <td className="px-3 py-2">{student.student?.branch ?? "-"}</td>
                    <td className="px-3 py-2">{student.student?.semester ?? "-"}</td>
                    <td className="px-3 py-2">{student.student?.cgpa ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


export default RoundManager;





