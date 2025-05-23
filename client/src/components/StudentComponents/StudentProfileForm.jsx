import React from "react";
import { FiUser, FiUpload, FiUserCheck } from "react-icons/fi";



const StudentProfileForm = ({
  studentInfo,
  setModalField,
  setRequestValue,
  setProofFile,
  modalField,
  proofFile,
  requestValue,
  handleRequestSubmit,
  phoneInput,
  setPhoneInput,
  handlePhoneUpdate,
  editingEmail,
  setEditingEmail,
  newEmail,
  setNewEmail,
  otp,
  setOtp,
  otpSent,
  handleSendOtp,
  handleVerifyOtp,
  verifying,
  resendDisabled,
  resendTimer,
  otpValid,
  onUploadMarksheet,
    pendingRequests,
}) => {
  const glowBtn =
    "px-4 py-2 font-semibold rounded-xl bg-gradient-to-br from-green-400 to-blue-600 text-white shadow-[0_5px_20px_rgba(59,130,246,0.6)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.7)] active:scale-95 transition-transform duration-300";
const isPending = (fieldKey) =>
  pendingRequests?.some((req) => req.field === fieldKey && req.status === "pending");






  const FieldRow = ({ label, value, fieldKey, requestable = true }) => (
    <div className="grid grid-cols-12 gap-3 items-center py-2 px-3 rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur border border-gray-300 dark:border-gray-700 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition duration-300">
      <div className="col-span-4 text-gray-700 dark:text-gray-300 font-medium text-sm">{label}</div>
      <div className="col-span-5 font-bold text-gray-800 dark:text-gray-100">{value ?? "Not Provided"}</div>
      {requestable && (
        <div className="col-span-3 text-right">
        <button
  onClick={() => setModalField(fieldKey)}
  disabled={isPending(fieldKey)}
  className={`px-4 py-2 rounded-xl text-white ${
    isPending(fieldKey)
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gradient-to-br from-green-400 to-blue-600 shadow-[0_5px_20px_rgba(59,130,246,0.6)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.7)] active:scale-95 transition-transform duration-300"
  }`}
>
  Request
</button>


        </div>
      )}
    </div>
  );


  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-400 to-blue-600 rounded-full shadow-glowBlue animate-pulse-glow">
          <FiUser className="text-white text-2xl" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
          Student Profile
        </h1>
      </div>


      {studentInfo ? (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-gray-600 dark:text-gray-400 font-medium mb-1 text-sm">Email</label>
              <div className="flex flex-col gap-2 w-full">
                {!editingEmail ? (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={studentInfo.email}
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    />
                    <button className={glowBtn} onClick={() => setEditingEmail(true)}>
                      Edit
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                      className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
                    />
                    {otpSent && (
                      <>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="Enter OTP"
                          className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
                          disabled={!otpValid}
                        />
                        <button
                          onClick={handleSendOtp}
                          disabled={resendDisabled}
                          className={`w-full px-4 py-2 font-semibold rounded-xl ${
                            resendDisabled
                              ? "bg-gray-400 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          } shadow-md transition duration-300`}
                        >
                          {resendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                        </button>
                      </>
                    )}
                    <div className="flex gap-2">
                      {!otpSent ? (
                        <button className={glowBtn} onClick={handleSendOtp}>
                          Send OTP
                        </button>
                      ) : (
                        <button className={glowBtn} onClick={handleVerifyOtp} disabled={verifying || !otpValid}>
                          {verifying ? "Verifying..." : "Verify OTP"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingEmail(false);
                          setNewEmail("");
                          setOtp("");
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-400 text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>


            {/* Phone */}
            <div>
              <label className="block text-gray-600 dark:text-gray-400 font-medium mb-1 text-sm">Phone</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  placeholder="Enter 10-digit phone"
                />
                <button className={`flex items-center gap-1 ${glowBtn}`} onClick={handlePhoneUpdate}>
                  <FiUserCheck /> Update
                </button>
              </div>
            </div>
          </div>


          <div className="space-y-2 mb-6">
            <FieldRow label="Name" value={studentInfo.name} requestable={false} />
            <FieldRow label="Branch" value={studentInfo.branch} requestable={false} />
            <FieldRow label="CGPA" value={studentInfo.cgpa} fieldKey="cgpa" />
            <FieldRow label="Semester" value={studentInfo.semester} fieldKey="semester" />
            <FieldRow label="Backlogs" value={studentInfo.backlogs} fieldKey="backlogs" />
          </div>


          {/* Marksheet Uploads */}
          <div className="space-y-4">
            {["10", "12"].map((type) => {
              const percent = type === "10" ? studentInfo.tenthPercent : studentInfo.twelfthPercent;
              const filePath = type === "10" ? studentInfo.tenthMarksheet : studentInfo.twelfthMarksheet;
              const labelId = `upload${type}`;


              return (
                <div
                  key={type}
                  className="bg-white/40 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-300 dark:border-gray-700 hover:shadow-lg transition duration-300"
                >
                  <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                    {type === "10" ? "10th" : "12th"} %: {percent ?? "Not Provided"}
                  </p>


                  {filePath ? (
                    <a
                      href={`http://localhost:5000${filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex gap-1 mt-2 ${glowBtn}`}
                    >
                      <FiUserCheck /> View
                    </a>
                  ) : (
                    <>
                      <input
                        type="file"
                        id={labelId}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) onUploadMarksheet(file, type);
                        }}
                      />
                      <label htmlFor={labelId} className={`inline-flex gap-1 cursor-pointer mt-2 ${glowBtn}`}>
                        <FiUpload /> Upload
                      </label>
                    </>
                  )}
                </div>
              );
            })}
          </div>


          {/* Request Modal */}
          {modalField && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-4 shadow-2xl animate-slideIn w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Update: {modalField}</h2>


                {modalField === "semester" ? (
                  <select
                    value={requestValue}
                    onChange={(e) => setRequestValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="">Select Semester</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={requestValue}
                    onChange={(e) => setRequestValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                )}


                <input
                  type="file"
                  className="w-full mt-3"
                  onChange={(e) => setProofFile(e.target.files[0])}
                />


                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                    onClick={() => setModalField(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${glowBtn} ${!proofFile ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleRequestSubmit}
                    disabled={!proofFile}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
      )}
    </div>
  );
};


export default StudentProfileForm;





