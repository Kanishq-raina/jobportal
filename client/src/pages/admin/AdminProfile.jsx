import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminComponents/Sidebar';
import TopNav from '../../components/AdminComponents/TopNav';
import AdminProfileForm from '../../components/AdminComponents/AdminProfileForm';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import clsx from 'clsx';


const AdminProfile = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [adminInfo, setAdminInfo] = useState(null);
 const [phoneInput, setPhoneInput] = useState('');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);


 const [editingEmail, setEditingEmail] = useState(false);
 const [newEmail, setNewEmail] = useState('');
 const [otpSent, setOtpSent] = useState(false);
 const [otp, setOtp] = useState('');
 const [verifying, setVerifying] = useState(false);


 const [resendTimer, setResendTimer] = useState(0);
 const [resendDisabled, setResendDisabled] = useState(true);
 const [otpExpiryTimer, setOtpExpiryTimer] = useState(0);
 const [otpValid, setOtpValid] = useState(true);


 useEffect(() => {
   const fetchProfile = async () => {
     try {
       const token = localStorage.getItem('adminToken');
       if (!token) {
         setError('No token found. Please login again.');
         setLoading(false);
         return;
       }


       const response = await fetch('https://jobportal-xqgm.onrender.com/api/admin/profile', {
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
       });


       const data = await response.json();
       if (!response.ok) {
         setError(data.message || 'Failed to fetch profile');
       } else {
         setAdminInfo(data);
         setPhoneInput(data.phone || '');
       }
     } catch (err) {
       console.error('Error loading profile:', err.message);
       setError('Something went wrong while fetching profile.');
     } finally {
       setLoading(false);
     }
   };


   fetchProfile();
 }, []);


 useEffect(() => {
   let interval;
   if (resendTimer > 0) {
     interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
   } else {
     setResendDisabled(false);
   }
   return () => clearInterval(interval);
 }, [resendTimer]);


 useEffect(() => {
   let interval;
   if (otpExpiryTimer > 0) {
     interval = setInterval(() => setOtpExpiryTimer((prev) => prev - 1), 1000);
   } else {
     setOtpValid(false);
     if (otpSent) toast.error("OTP expired. Please resend.");
   }
   return () => clearInterval(interval);
 }, [otpExpiryTimer]);


 const handlePhoneUpdate = async () => {
   const token = localStorage.getItem('adminToken');
   try {
     const res = await fetch('https://jobportal-xqgm.onrender.com/api/admin/update-phone', {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ phone: phoneInput }),
     });


     const data = await res.json();
     if (!res.ok) {
       toast.error(data.message || 'Phone update failed');
     } else {
       toast.success('Phone updated successfully!');
       setAdminInfo((prev) => ({ ...prev, phone: phoneInput }));
     }
   } catch (err) {
     console.error('Phone update error:', err);
     toast.error('Failed to update phone');
   }
 };


 const handleSendOtp = async () => {
   try {
     const token = localStorage.getItem('adminToken');
     await axios.post(
       'https://jobportal-xqgm.onrender.com/api/admin/send-email-otp',
       { newEmail },
       {
         withCredentials: true,
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );
     toast.success("OTP sent to new email");
     setOtpSent(true);
     setOtpValid(true);
     setResendDisabled(true);
     setResendTimer(10);
     setOtpExpiryTimer(120);
   } catch (err) {
     console.error("Send OTP Error:", err.response || err);
     toast.error(err.response?.data?.message || "Failed to send OTP");
   }
 };


 const handleVerifyOtp = async () => {
   setVerifying(true);
   try {
     const token = localStorage.getItem('adminToken');
     await axios.post(
       'https://jobportal-xqgm.onrender.com/api/admin/verify-email-otp',
       { otp },
       {
         withCredentials: true,
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );


     toast.success("✅ Email updated successfully");
     setEditingEmail(false);
     setOtp('');
     setNewEmail('');
     setOtpSent(false);
     setAdminInfo(prev => ({ ...prev, email: newEmail }));
   } catch (err) {
     const message = err.response?.data?.message;
     if (message === "This email is already in use.") {
       toast.error("❌ Email already exists. Please use a different one.");
     } else if (message === "Incorrect OTP") {
       toast.error("❌ The OTP you entered is incorrect.");
     } else if (message === "OTP expired or invalid") {
       toast.error("❌ The OTP has expired. Please resend.");
     } else {
       toast.error("❌ Verification failed. Please try again.");
     }
     console.error("Verify OTP Error:", err.response || err);
   } finally {
     setVerifying(false);
   }
 };


 return (
   <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
     <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         'flex flex-col flex-1 transition-all duration-300',
         isCollapsed ? 'ml-20' : 'ml-24'
       )}
     >
       <TopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} isCollapsed={isCollapsed} />
       <main className="mt-[72px] px-6 py-10 text-gray-800 dark:text-white">
         <Toaster />
         {loading ? (
           <div className="text-center py-10 text-xl text-gray-500 dark:text-gray-400">
             Loading profile...
           </div>
         ) : error ? (
           <div className="text-center py-10 text-red-600 font-semibold">{error}</div>
         ) : (
           <AdminProfileForm
             adminInfo={adminInfo}
             phoneInput={phoneInput}
             setPhoneInput={setPhoneInput}
             handlePhoneUpdate={handlePhoneUpdate}
             editingEmail={editingEmail}
             setEditingEmail={setEditingEmail}
             newEmail={newEmail}
             setNewEmail={setNewEmail}
             otp={otp}
             setOtp={setOtp}
             otpSent={otpSent}
             handleSendOtp={handleSendOtp}
             handleVerifyOtp={handleVerifyOtp}
             verifying={verifying}
             resendDisabled={resendDisabled}
             resendTimer={resendTimer}
             otpValid={otpValid}
           />
         )}
       </main>
     </div>
   </div>
 );
};


export default AdminProfile;





