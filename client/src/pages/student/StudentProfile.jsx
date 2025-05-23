import React, { useEffect, useState } from "react";
import StudentSidebar from "../../components/StudentComponents/StudentSidebar";
import StudentTopNav from "../../components/StudentComponents/StudentTopNav";
import { toast, Toaster } from "react-hot-toast";
import StudentProfileForm from "../../components/StudentComponents/StudentProfileForm";
import clsx from "clsx";




const StudentProfile = () => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [studentInfo, setStudentInfo] = useState(null);
 const [modalField, setModalField] = useState(null);
 const [requestValue, setRequestValue] = useState("");
 const [proofFile, setProofFile] = useState(null);
 const [phoneInput, setPhoneInput] = useState("");




 const [editingEmail, setEditingEmail] = useState(false);
 const [newEmail, setNewEmail] = useState("");
 const [otpSent, setOtpSent] = useState(false);
 const [otp, setOtp] = useState("");
 const [verifying, setVerifying] = useState(false);
 const [resendTimer, setResendTimer] = useState(0);
 const [resendDisabled, setResendDisabled] = useState(true);
 const [otpExpiryTimer, setOtpExpiryTimer] = useState(0);
 const [otpValid, setOtpValid] = useState(true);
const [pendingRequests, setPendingRequests] = useState([]);




 const isCGPAValid = (cgpa) => /^[0-9](\.\d{1,2})?$/.test(cgpa) && cgpa >= 0 && cgpa <= 10;
 const isSemesterValid = (semester) => semester >= 1 && semester <= 10;
 const isBacklogValid = (backlogs) => backlogs >= 0 && backlogs <= 30;




 const fetchProfile = async () => {
  try {
    const token = localStorage.getItem("studentToken");


    const [profileRes, requestsRes] = await Promise.all([
      fetch("http://localhost:5000/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:5000/api/student/requests", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);


    const profileData = await profileRes.json();
    const requestsData = await requestsRes.json();


    if (profileRes.ok && requestsRes.ok) {
      if (profileData.firstName && profileData.lastName)
        profileData.name = `${profileData.firstName} ${profileData.lastName}`;
      setStudentInfo(profileData);
      setPhoneInput(profileData.phone || "");


      const filtered = requestsData.filter((r) =>
        ["cgpa", "semester", "backlogs"].includes(r.field) && r.status === "pending"
      );
      setPendingRequests(filtered);
    } else {
      toast.error("Failed to load profile or requests");
    }
  } catch (err) {
    console.error("Error:", err.message);
    toast.error("Failed to load profile data");
  }
};






 useEffect(() => { fetchProfile(); }, []);




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
   if (!/^\d{10}$/.test(phoneInput)) {
     toast.error("Enter a valid 10-digit phone number");
     return;
   }




   try {
     const token = localStorage.getItem("studentToken");
     const res = await fetch("http://localhost:5000/api/student/update-phone", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ phone: phoneInput }),
     });




     const data = await res.json();
     if (res.ok) {
       toast.success("Phone number updated successfully");
       fetchProfile();
     } else {
       toast.error(data.message || "Failed to update phone");
     }
   } catch {
     toast.error("Error updating phone number");
   }
 };




 const handleSendOtp = async () => {
   try {
     const token = localStorage.getItem("studentToken");
     await fetch("http://localhost:5000/api/student/send-email-otp", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ newEmail }),
     });
     toast.success("OTP sent to your new email");
     setOtpSent(true);
     setOtpValid(true);
     setResendDisabled(true);
     setResendTimer(10);
     setOtpExpiryTimer(120);
   } catch (err) {
     toast.error("Failed to send OTP");
     console.error(err);
   }
 };




 const handleVerifyOtp = async () => {
   setVerifying(true);
   try {
     const token = localStorage.getItem("studentToken");
     const res = await fetch("http://localhost:5000/api/student/verify-email-otp", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ otp }),
     });
     const data = await res.json();
     if (res.ok) {
       toast.success("Email updated successfully");
       setEditingEmail(false);
       setOtp("");
       setOtpSent(false);
       setNewEmail("");
       fetchProfile();
     } else {
       toast.error(data.message || "OTP verification failed");
     }
   } catch (err) {
     toast.error("Error verifying OTP");
     console.error(err);
   } finally {
     setVerifying(false);
   }
 };




 const handleMarksheetUpload = async (file, type) => {
   if (!file) return;
   const formData = new FormData();
   formData.append("marksheet", file);
   formData.append("type", type);




   try {
     const token = localStorage.getItem("studentToken");
     const res = await fetch("http://localhost:5000/api/student/upload-marksheet", {
       method: "POST",
       headers: { Authorization: `Bearer ${token}` },
       body: formData,
     });




     const data = await res.json();
     if (res.ok) {
       toast.success(`${type}th Marksheet uploaded`);
       fetchProfile();
     } else {
       toast.error(data.message || "Upload failed");
     }
   } catch {
     toast.error("Upload error");
   }
 };




 const handleRequestSubmit = async () => {
   if (modalField === "cgpa" && !isCGPAValid(requestValue)) {
     toast.error("Invalid CGPA. It should be between 0 and 10.");
     return;
   }
   if (modalField === "semester" && !isSemesterValid(requestValue)) {
     toast.error("Invalid Semester. It should be between 1 and 10.");
     return;
   }
   if (modalField === "backlogs" && !isBacklogValid(requestValue)) {
     toast.error("Invalid Backlogs count. It should be between 0 and 30.");
     return;
   }




   try {
     const token = localStorage.getItem("studentToken");
     const formData = new FormData();
     formData.append("field", modalField);
     formData.append("newValue", requestValue);
     if (proofFile) formData.append("proof", proofFile);




     const res = await fetch("http://localhost:5000/api/student/auth-request", {
       method: "POST",
       headers: { Authorization: `Bearer ${token}` },
       body: formData,
     });




     const data = await res.json();
     if (res.ok) {
       toast.success("Request submitted for verification");
       setModalField(null);
       setRequestValue("");
       setProofFile(null);
       fetchProfile();
     } else {
       toast.error(data.message || "Request failed");
     }
   } catch (err) {
     console.error("Submit error:", err);
     toast.error("Failed to submit request");
   }
 };




 return (
   <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
     <Toaster position="top-center" />
     <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
     <div
       className={clsx(
         "flex flex-col flex-1 transition-all duration-300 ease-in-out",
         isCollapsed ? "ml-[72px]" : "ml-24"
       )}
     >
       <StudentTopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} isCollapsed={isCollapsed} />
       <main className="mt-[72px] px-6 py-10 flex justify-center">
         <div className="w-full max-w-3xl p-6 md:p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 animate-fadeIn">
           <StudentProfileForm
             studentInfo={studentInfo}
             modalField={modalField}
             setModalField={setModalField}
             requestValue={requestValue}
             setRequestValue={setRequestValue}
             proofFile={proofFile}
             setProofFile={setProofFile}
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
             handleRequestSubmit={handleRequestSubmit}
             onUploadMarksheet={handleMarksheetUpload}
              pendingRequests={pendingRequests}
           />
         </div>
       </main>
     </div>
   </div>
 );
};




export default StudentProfile;















