import React from "react";
import { FiUser, FiUserCheck } from "react-icons/fi";


const AdminProfileForm = ({
  adminInfo,
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
  otpValid
}) => {
  const glowBtn =
    "w-full px-4 py-2 font-semibold rounded-xl bg-gradient-to-br from-green-400 to-blue-600 text-white shadow-md hover:shadow-lg active:scale-95 transition-transform duration-300";


  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-8 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-green-400 to-blue-600 rounded-full shadow-glowBlue animate-pulse-glow">
          <FiUser className="text-white text-2xl" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
          Admin Profile
        </h1>
      </div>


      {adminInfo ? (
        <div className="grid gap-6">
          {/* Name */}
          <div className="grid grid-cols-12 items-center gap-4">
            <label className="col-span-3 text-gray-700 dark:text-gray-300 font-medium text-sm">Name</label>
            <div className="col-span-9 font-bold text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
              {adminInfo.name ?? "Not Provided"}
            </div>
          </div>


          {/* Email Update Flow */}
          <div className="grid grid-cols-12 items-start gap-4">
            <label className="col-span-3 text-gray-700 dark:text-gray-300 font-medium text-sm pt-2">Email</label>


            {!editingEmail ? (
              <>
                <div className="col-span-6 font-bold text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  {adminInfo.email ?? "Not Provided"}
                </div>
                <div className="col-span-3">
                  <button className={glowBtn} onClick={() => setEditingEmail(true)}>Edit</button>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-6 space-y-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    placeholder="Enter new email"
                  />


                  {otpSent && (
                    <>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        placeholder="Enter OTP"
                        disabled={!otpValid}
                      />
                      <button
                        onClick={handleSendOtp}
                        disabled={resendDisabled}
                        className={`w-full px-4 py-2 font-semibold rounded-xl ${
                          resendDisabled
                            ? 'bg-gray-400 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } shadow-md transition duration-300`}
                      >
                        {resendDisabled
                          ? `Resend OTP in ${resendTimer}s`
                          : 'Resend OTP'}
                      </button>
                    </>
                  )}
                </div>


                <div className="col-span-3 space-y-2">
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
                      setNewEmail('');
                      setOtp('');
                    }}
                    className="w-full px-4 py-2 font-semibold rounded-xl bg-gray-400 text-white shadow-md hover:shadow-lg active:scale-95 transition-transform duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>


          {/* Phone */}
          <div className="grid grid-cols-12 items-center gap-4">
            <label className="col-span-3 text-gray-700 dark:text-gray-300 font-medium text-sm">Phone</label>
            <div className="col-span-6">
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                placeholder="Enter phone number"
              />
            </div>
            <div className="col-span-3">
              <button className={`flex items-center justify-center gap-1 ${glowBtn}`} onClick={handlePhoneUpdate}>
                <FiUserCheck /> Update
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
      )}
    </div>
  );
};


export default AdminProfileForm;





