import User from "../models/user.js";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import { sendStudentEmail } from "../utils/sendStudentEmail.js";
import Job from "../models/job.js"
import Application from "../models/Application.js";
import AuthRequest from "../models/AuthRequest.js";
import Course from "../models/Course.js"
import crypto from "crypto";
import redis from "../utils/redisClient.js";
import { sendOTPEmail } from "../utils/sendAdminOTPEmail.js";
import { sendConfirmation } from "../utils/SendStudentEmailUpdateConfirmation.js";








// ✅ Add single student




// ✅ Update credentials
export const updateCredentials = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newUsername, newPassword } = req.body;


    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Unauthorized" });
    }


    if (newUsername && newUsername !== user.username) {
      const existing = await User.findOne({ username: newUsername });
      if (existing) return res.status(400).json({ message: "Username already taken" });
      user.username = newUsername;
    }


    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
    }


    await user.save();


    res.status(200).json({
      message: "Credentials updated",
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error("Update credentials error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get full student + user profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate("user", "name email phone")
      .populate("course", "name"); // ✅ Include course name


    if (!student) return res.status(404).json({ message: "Student not found" });


    // Required fields to generate resume
    const requiredFields = [
      student.cgpa,
      student.semester,
      student.tenthPercent,
      student.twelfthPercent,
      student.skills?.length,
      student.user?.phone,
    ];


    const canGenerateResume = requiredFields.every(Boolean);


    res.status(200).json({
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      branch: student.branch,
      cgpa: student.cgpa,
      semester: student.semester,
      backlogs: student.backlogs,
      gapYears: student.gapYears,
      tenthPercent: student.tenthPercent,
      twelfthPercent: student.twelfthPercent,
      course: student.course?.name || "", // ✅ Add course name
      github: student.github,
      linkedin: student.linkedin,
      skills: student.skills,
      projects: student.projects,
      canGenerateResume,
      tenthMarksheet: student.tenthMarksheet,
      twelfthMarksheet: student.twelfthMarksheet,
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, phone, tenthPercent, twelfthPercent } = req.body;


    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Unauthorized" });
    }


    if (email) user.email = email;
    if (phone) user.phone = phone;
    await user.save();


    const student = await Student.findOne({ user: user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });


    if (tenthPercent) student.tenthPercent = tenthPercent;
    if (twelfthPercent) student.twelfthPercent = twelfthPercent;


    // Handle marksheet file uploads
    if (req.files?.marksheet10?.[0]) {
      student.marksheet10File = `/uploads/marksheets/${req.files.marksheet10[0].filename}`;
    }


    if (req.files?.marksheet12?.[0]) {
      student.marksheet12File = `/uploads/marksheets/${req.files.marksheet12[0].filename}`;
    }


    await student.save();


    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      studentProfile: {
        tenthPercent: student.tenthPercent,
        twelfthPercent: student.twelfthPercent,
        marksheet10File: student.tenthMarksheet,
        marksheet12File: student.twelfthMarksheet,
      },
    });
  } catch (err) {
    console.error("Update student profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};








export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;


    const student = await Student.findOne({ user: studentId })
      .populate("user")
      .populate("course");


    if (!student || !student.user) {
      return res.status(404).json({ message: "Student not found." });
    }


    // ✅ Check essential documents only
    const missingFields = [];
    if (!student.resumeLink) missingFields.push("Resume");
    if (!student.tenthMarksheet) missingFields.push("10th Marksheet");
    if (!student.twelfthMarksheet) missingFields.push("12th Marksheet");


    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Please complete your profile before applying.",
        missing: missingFields,
      });
    }


    // ✅ Fetch job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (new Date(job.deadline) < new Date()) {
  return res.status(400).json({ message: "Deadline has passed. You can no longer apply to this job." });
}


    const e = job.eligibility || {};
    const failingCriteria = [];


    if (student.cgpa < (e.minCGPA || 0)) failingCriteria.push("CGPA");
    if (student.backlogs > (e.maxBacklogs || 0)) failingCriteria.push("Backlogs");
    if (student.gapYears > (e.allowedGapYears || 0)) failingCriteria.push("Gap Years");
    if (student.tenthPercent < (e.minTenthPercent || 0)) failingCriteria.push("10th Percent");
    if (student.twelfthPercent < (e.minTwelfthPercent || 0)) failingCriteria.push("12th Percent");
    if (!e.semestersAllowed?.includes(student.semester)) failingCriteria.push("Semester");
    if (!e.branchesAllowed?.map(b => b.toLowerCase()).includes(student.branch.toLowerCase())) failingCriteria.push("Branch");
    if (!job.coursesAllowed?.map(c => c.toLowerCase()).includes(student.course.name.toLowerCase())) failingCriteria.push("Course");


    if (failingCriteria.length > 0) {
      return res.status(403).json({
        message: "You are not eligible for this job.",
        failingCriteria,
      });
    }


    const alreadyApplied = await Application.findOne({ job: jobId, student: studentId });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied to this job." });
    }


    await Application.create({ job: jobId, student: studentId });


    return res.status(200).json({ message: "Application submitted successfully." });


  } catch (err) {
    console.error("Apply Error:", err);
    return res.status(500).json({ message: "Server error while applying." });
  }
};








export const getStudentJobs = async (req, res) => {
  try {
    const studentId = req.user.id;


    // Fetch both active and taken jobs
    const jobs = await Job.find({ status: { $in: ["active", "taken"] } }).lean();


    // Fetch applications with round status
    const applications = await Application.find({ student: studentId }).select("job roundStatus").lean();


    const jobMap = {};
    applications.forEach(app => {
      jobMap[app.job.toString()] = app.roundStatus || {};
    });


    const jobsWithStatus = jobs
      .filter(job => {
        const appliedRounds = jobMap[job._id.toString()];
        // Show active jobs always if applied, show taken jobs only if selected in final round
        if (job.status === "taken") {
          return appliedRounds?.final === "selected";
        }
        return true;
      })
      .map(job => {
        const jobId = job._id.toString();
        const roundStatus = jobMap[jobId];
        return {
          ...job,
          applied: !!roundStatus,
          rounds: roundStatus || {},
        };
      });


    res.status(200).json(jobsWithStatus);
  } catch (err) {
    console.error("Job Fetch Error:", err);
    res.status(500).json({ message: "Failed to load jobs" });
  }
};






export const updateResumeInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills, projects } = req.body;


    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });


    if (skills) student.skills = skills.split(',').map(s => s.trim());
    if (projects) student.projects = projects.split('\n').map(p => p.trim());


    await student.save();


    res.status(200).json({ message: 'Resume data updated successfully' });
  } catch (err) {
    console.error("Resume update error:", err);
    res.status(500).json({ message: "Server error updating resume data" });
  }
};
export const getMyAuthRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await AuthRequest.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch Auth Requests Error:", err);
    res.status(500).json({ message: "Failed to fetch your verification requests" });
  }
};
// POST /api/student/start-phone-verification






// Update verified phone number






export const updateStudentPhone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone } = req.body;


    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number. Must be 10 digits." });
    }


    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });


    user.phone = phone;
    await user.save();


    res.status(200).json({ message: "Phone number updated successfully." });
  } catch (err) {
    console.error("Phone update error:", err);
    res.status(500).json({ message: "Server error while updating phone number." });
  }
};


export const getStudentProfileForAdmin = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("course", "name");


    if (!student) return res.status(404).json({ message: "Student not found" });


    const allJobs = await Job.find({ status: "active" }).lean();
    const appliedJobs = await Application.find({ student: student.user.id }).select("job").lean();
    const appliedJobIds = appliedJobs.map((a) => a.job.toString());


    const eligibleJobs = [];
    const ineligibleJobs = [];


    for (const job of allJobs) {
      const e = job.eligibility || {};
      const fails = [];


      if (student.cgpa < (e.minCGPA || 0)) fails.push("CGPA");
      if (student.backlogs > (e.maxBacklogs || 0)) fails.push("Backlogs");
      if (student.gapYears > (e.allowedGapYears || 0)) fails.push("Gap Years");
      if (student.tenthPercent < (e.minTenthPercent || 0)) fails.push("10th Percent");
      if (student.twelfthPercent < (e.minTwelfthPercent || 0)) fails.push("12th Percent");
      if (!e.semestersAllowed?.includes(student.semester)) fails.push("Semester");
      if (!e.branchesAllowed?.map(b => b.toLowerCase()).includes(student.branch.toLowerCase())) fails.push("Branch");
      if (!job.coursesAllowed?.map(c => c.toLowerCase()).includes(student.course.name.toLowerCase())) fails.push("Course");


      const isApplied = appliedJobIds.includes(job._id.toString());


      if (fails.length === 0) {
        eligibleJobs.push({
          _id: job._id,
          title: job.title,
          applied: isApplied
        });
      } else {
        ineligibleJobs.push({
          _id: job._id,
          title: job.title,
          failingCriteria: fails
        });
      }
    }


    return res.status(200).json({
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone || "",
      course: student.course?.name || "",
      branch: student.branch,
      cgpa: student.cgpa,
      semester: student.semester,
      backlogs: student.backlogs,
      gapYears: student.gapYears,
      tenthPercent: student.tenthPercent,
      twelfthPercent: student.twelfthPercent,
      skills: student.skills || [],
      resumeLink: student.resumeLink || "",
      tenthMarksheet: student.tenthMarksheet || "",
      twelfthMarksheet: student.twelfthMarksheet || "",
      eligibleJobs,
      ineligibleJobs,
    });
  } catch (err) {
    console.error("Admin profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const saveResumeData = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });




    student.resumeData = req.body; // assuming you're sending resume object
    await student.save();




    res.status(200).json({ message: "Resume data saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving resume" });
  }
};
export const getResumeData = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });




    res.status(200).json(student.resumeData || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching resume" });
  }
};


export const sendStudentEmailOTP = async (req, res) => {
  const { newEmail } = req.body;
  const studentId = req.user.id;




  const otp = Math.floor(100000 + Math.random() * 900000).toString();




  try {
    await redis.setEx(`student-email-otp:${studentId}`, 600, JSON.stringify({ otp, newEmail }));
    await sendOTPEmail(newEmail, otp);
    res.json({ message: 'OTP sent to new email' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};




export const verifyStudentEmailOTP = async (req, res) => {
  const { otp } = req.body;
  const studentId = req.user.id;




  try {
    const data = await redis.get(`student-email-otp:${studentId}`);
    if (!data) return res.status(400).json({ message: 'OTP expired or invalid' });




    const { otp: storedOtp, newEmail } = JSON.parse(data);




    if (storedOtp !== otp) return res.status(400).json({ message: 'Incorrect OTP' });




    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ message: 'This email is already in use.' });




    await User.findByIdAndUpdate(studentId, { email: newEmail });
    await redis.del(`student-email-otp:${studentId}`);
    const student = await User.findById(studentId);
    await sendConfirmation(newEmail, student?.username);
    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};






export const getStudentAuthRequests = async (req, res) => {
  try {
    const userId = req.user.id;
   
    const student=await Student.findOne({user: userId});
    const requests = await AuthRequest.find({ student: student._id }).sort({ createdAt: -1 });


    console.log("📋 Found Auth Requests:", requests.length);
    requests.forEach((r, i) => {
      console.log(`[#${i + 1}] field: ${r.field}, value: ${r.newValue}, status: ${r.status}`);
    });


    res.status(200).json(requests);
  } catch (error) {
    console.error("❌ Error fetching auth requests:", error);
    res.status(500).json({ message: "Failed to fetch auth requests" });
  }
};




export const getStudentApplicationsWithRounds = async (req, res) => {
  try {
    const studentId = req.user.id; // Extracted from verifyToken middleware


    // Fetch applications for this student
    const applications = await Application.find({ student: studentId })
      .populate("job")
      .lean();


    const result = applications.map((app) => ({
      job: app.job,
      roundStatus: app.roundStatus || {},
    }));


    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to fetch student applications:", err);
    res.status(500).json({ message: "Failed to load student applications" });
  }
};



