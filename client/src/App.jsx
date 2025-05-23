import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddStudent from "./pages/admin/AddStudent";
import AuthRequest from "./pages/admin/AuthRequest";
import CreateJob from "./pages/admin/CreateJob";
import ManageJob from "./pages/admin/ManageJob";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";
import StudentDetail from "./pages/admin/StudentDetail";
import Company from "./pages/student/Company";
import ContactUs from "./pages/student/ContactUs";
import ResumeGenerate from "./pages/student/ResumeGenerate";
import StudentProfile from "./pages/student/StudentProfile";
import StudentSettings from "./pages/student/StudentSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthStatus from "./pages/student/AuthStatus";
import SetPassword  from "./pages/SetPassword";
import ApplyToJob from "./pages/applytojob";
 // Optional 404

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/applytojob" element={<ApplyToJob />} />      
      
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/addstudent" element={<AddStudent />} />
      <Route path="/admin/authrequest" element={<AuthRequest />} />
      <Route path="/admin/createjob" element={<CreateJob />} />
      <Route path="/admin/managejob" element={<ManageJob />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/studentdetail" element={<StudentDetail />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/company" element={<Company />} />
      <Route path="/student/contact" element={<ContactUs />} />
      <Route path="/student/resume" element={<ResumeGenerate />} />
      <Route path="/student/settings" element={<StudentSettings />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/authstatus" element={<AuthStatus />} />
      {/* Catch-all 404 route */}
    
    </Routes>
  );
};

export default App;
