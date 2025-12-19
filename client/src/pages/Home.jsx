import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import Lottie from "lottie-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {FiEye,FiEyeOff} from "react-icons/fi";
import adminBg from "../assets/admin-bg.json";
import studentBg from "../assets/student-bg.json";
import loginAnim from "../assets/login-animation.json";
import splashAnim from "../assets/splash-animation.json";


const Home = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [splashVisible, setSplashVisible] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const navigate = useNavigate();


  // Splash animation on first load
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 2500);
    return () => clearTimeout(splashTimer);
  }, []);


  const handleOpen = (selectedRole) => {
    setRole(selectedRole);
    setUsername("");
    setPassword("");
    setIsOpen(true);
  };


  const handleClose = () => {
    setIsOpen(false);
    setRole("");
    setUsername("");
    setPassword("");
  };


  const handleLogin = async (e) => {
    e.preventDefault();


    try {
      const response = await fetch("https://jobportal-xqgm.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({identifier: username, password }),
      });


      const data = await response.json();


      if (response.ok) {
        toast.success(`Logged in as ${data.role}`);
        handleClose();


        if (data.role === "admin") {
          localStorage.setItem("adminInfo", JSON.stringify(data));
          localStorage.setItem("adminToken", data.token);
          navigate("/admin/dashboard");
        } else if (data.role === "student") {
          localStorage.setItem("studentInfo", JSON.stringify(data));
          localStorage.setItem("studentToken", data.token);
          navigate("/student/dashboard");
        }
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />


      {/* Splash Screen */}
      {splashVisible ? (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <Lottie animationData={splashAnim} loop={false} className="h-64" />
        </div>
      ) : (
        <div className="min-h-screen flex font-poppins">
          {/* Admin Side */}
          <div
            className="w-1/2 relative flex items-center justify-center bg-black group overflow-hidden cursor-pointer"
            onClick={() => handleOpen("admin")}
          >
            <Lottie
              animationData={adminBg}
              loop
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="z-10 text-center">
              <h2 className="text-3xl font-bold text-white group-hover:scale-110 group-hover:text-blue-400 transition duration-300">
                Admin
              </h2>
            </div>
            <div className="absolute inset-0 group-hover:brightness-125 group-hover:backdrop-blur-md transition duration-300" />
          </div>


          {/* Student Side */}
          <div
            className="w-1/2 relative flex items-center justify-center bg-black group overflow-hidden cursor-pointer"
            onClick={() => handleOpen("student")}
          >
            <Lottie
              animationData={studentBg}
              loop
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="z-10 text-center">
              <h2 className="text-3xl font-bold text-white group-hover:scale-110 group-hover:text-green-400 transition duration-300">
                Student
              </h2>
            </div>
            <div className="absolute inset-0 group-hover:brightness-125 group-hover:backdrop-blur-md transition duration-300" />
          </div>


          {/* Login Modal */}
          <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-white/30 dark:bg-gray-900/30 text-black dark:text-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 backdrop-blur-xl transition">
                <Lottie animationData={loginAnim} loop className="h-40 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4 text-center capitalize">
                  Login as {role}
                </h2>


                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />


<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-4 py-2 pr-10 rounded-xl bg-gray-100/80 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-300 hover:text-blue-600"
  >
    {showPassword ? <FiEyeOff /> : <FiEye />}
  </button>
</div>




                  {/* 🔐 Forgot Password */}
                  <div className="text-right text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/forgot-password");
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:underline transition duration-150"
                    >
                      Forgot Password?
                    </button>
                  </div>


                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-all transform hover:scale-105"
                  >
                    Login
                  </button>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      )}
    </>
  );
};


export default Home;





