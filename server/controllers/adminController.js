import User from '../models/user.js';
import Student from '../models/Student.js';
import crypto from "crypto";
import { sendStudentEmail } from "../utils/sendStudentEmail.js";
import { sendCustomMail } from '../utils/sendCustomMail.js';
import Job from "../models/job.js";
import Application from "../models/Application.js";
import bcrypt from 'bcryptjs';
import Course from '../models/Course.js';
import xlsx from "xlsx";
import redis from '../utils/redisClient.js';
import {sendOTPEmail} from '../utils/sendAdminOTPEmail.js';
import { sendEmailUpdateConfirmation } from '../utils/sendEmailUpdateConfirmation.js';
import fs from "fs";


// GET /api/admin/students
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const addSingleStudent = async (req, res) => {
  const generateToken = () => crypto.randomBytes(32).toString("hex");


  // Capitalize helper
  const capitalizeWords = (str) =>
    str?.trim().split(/\s+/).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");


  try {
    const {
      firstName,
      lastName,
      email,
      course,
      branch,
      cgpa,
      semester,
      gapYears,
      backlogs,
      tenthPercent,
      twelfthPercent
    } = req.body;


    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ message: "Email must be Gmail" });
    }


    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });


    // Validate course + branch combo
    const courseDoc = await Course.findOne({ name: course });
    if (!courseDoc) return res.status(400).json({ message: "Invalid course" });
    if (!courseDoc.branches.includes(branch)) {
      return res.status(400).json({ message: "Invalid branch for selected course" });
    }


    // ✅ Capitalize names
    const cleanFirstName = capitalizeWords(firstName);
    const cleanLastName = capitalizeWords(lastName);
    const name = cleanLastName ? `${cleanFirstName} ${cleanLastName}` : cleanFirstName;


    const token = generateToken();
    const tokenExpiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours


    const user = await User.create({
      name,
      email,
      role: "student",
      resetToken: token,
      resetTokenExpiry: tokenExpiry,
    });


    const student = await Student.create({
      user: user._id,
      course: courseDoc._id,
      branch,
      cgpa,
      semester,
      gapYears,
      backlogs,
      tenthPercent,
      twelfthPercent,
    });


    const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
    await sendStudentEmail(email, link);


    res.status(201).json({ message: "Student added and link sent", student });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// ✅ Add bulk students
export const addBulkStudents = async (req, res) => {
  const generateToken = () => crypto.randomBytes(32).toString("hex");
  try {
    const { students } = req.body;
    let added = 0;
    const errors = [];


    for (const s of students) {
      if (!s.email.endsWith("@gmail.com")) {
        errors.push({ email: s.email, reason: "Invalid email" });
        continue;
      }


      const existing = await User.findOne({ email: s.email });
      if (existing) continue;


      const courseDoc = await Course.findOne({ name: s.course });
      if (!courseDoc) {
        errors.push({ email: s.email, reason: "Invalid course" });
        continue;
      }


      if (!courseDoc.branches.includes(s.branch)) {
        errors.push({ email: s.email, reason: "Invalid branch for course" });
        continue;
      }


      const name = s.lastName ? `${s.firstName} ${s.lastName}` : s.firstName;
      const token = generateToken();
      const tokenExpiry = Date.now() + 1000 * 60 * 60 * 24;


      const user = await User.create({
        name,
        email: s.email,
        role: "student",
        resetToken: token,
        resetTokenExpiry: tokenExpiry,
      });


      await Student.create({
        user: user._id,
        course: courseDoc._id,
        branch: s.branch,
        cgpa: s.cgpa,
        semester: s.semester,
        backlogs: s.backlogs || 0,
        gapYears: s.gapYears || 0,
        tenthPercent: s.tenthPercent,
        twelfthPercent: s.twelfthPercent,
      });


      const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
      await sendStudentEmail(s.email, link);


      added++;
    }


    res.status(201).json({
      message: "Bulk upload processed",
      count: added,
      errors,
    });
  } catch (err) {
    console.error("Bulk student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAllStudents = async (req, res) => {
  try {
    const {
      name,
      email,
      branch,
      minCgpa,
      maxCgpa,
      minBacklogs,
      maxBacklogs,
      minSemester,
      maxSemester,
      minGapYears,
      maxGapYears,
      sortBy,
    } = req.query;


    const userQuery = { role: 'student' };
    if (name?.trim()) userQuery.name = { $regex: name.trim(), $options: 'i' };
    if (email?.trim()) userQuery.email = { $regex: email.trim(), $options: 'i' };


    const users = await User.find(userQuery).select('name email phone username');
    const userIds = users.map((u) => u._id);


    const studentQuery = { user: { $in: userIds } };
    if (branch?.trim()) studentQuery.branch = branch.trim();
    if (minCgpa) studentQuery.cgpa = { ...studentQuery.cgpa, $gte: parseFloat(minCgpa) };
    if (maxCgpa) studentQuery.cgpa = { ...studentQuery.cgpa, $lte: parseFloat(maxCgpa) };
    if (minBacklogs) studentQuery.backlogs = { ...studentQuery.backlogs, $gte: parseInt(minBacklogs) };
    if (maxBacklogs) studentQuery.backlogs = { ...studentQuery.backlogs, $lte: parseInt(maxBacklogs) };
    if (minSemester) studentQuery.semester = { ...studentQuery.semester, $gte: parseInt(minSemester) };
    if (maxSemester) studentQuery.semester = { ...studentQuery.semester, $lte: parseInt(maxSemester) };
    if (minGapYears) studentQuery.gapYears = { ...studentQuery.gapYears, $gte: parseInt(minGapYears) };
    if (maxGapYears) studentQuery.gapYears = { ...studentQuery.gapYears, $lte: parseInt(maxGapYears) };


    let sortOption = {};
    if (sortBy) {
      if (sortBy.startsWith('-')) {
        sortOption[sortBy.slice(1)] = -1;
      } else {
        sortOption[sortBy] = 1;
      }
    }


    const students = await Student.find(studentQuery)
      .populate('user', 'name email phone username')
      .populate('course', 'name') // ✅ fetch course name
      .sort(sortOption)
      .lean();


    const result = students.map((s) => ({
      _id: s._id,
      name: s.user?.name || '',
      email: s.user?.email || '',
      phone: s.user?.phone || '',
      username: s.user?.username || '',
      cgpa: s.cgpa,
      backlogs: s.backlogs,
      gapYears: s.gapYears,
      semester: s.semester,
      branch: s.branch,
      course: s.course?.name || '', // ✅ send only course name
    }));


    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Error fetching students:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
 














export const sendMailToStudents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }


    const { recipients, subject, body } = req.body;


    if (!recipients || recipients.length === 0 || !subject || !body) {
      return res.status(400).json({ message: 'Missing fields' });
    }


    const count = await sendCustomMail(recipients, subject, body);
    return res.status(200).json({ message: `Sent ${count} emails` });
  } catch (err) {
    console.error('Mail send error:', err);
    return res.status(500).json({ message: 'Email send failed' });
  }
};




export const deleteStudents = async (req, res) => {
  try {
    const { emails } = req.body;


    if (!emails || emails.length === 0) {
      return res.status(400).json({ message: 'No emails provided' });
    }


    let deletedCount = 0;


    for (const email of emails) {
      const user = await User.findOne({ email });


      if (user) {
        const student = await Student.findOne({ user: user._id });
        if (student) await Student.findByIdAndDelete(student._id);


        await User.findByIdAndDelete(user._id);
        deletedCount++;
      }
    }


    return res.status(200).json({
      message: 'Selected students deleted',
      deletedCount,
    });
  } catch (err) {
    console.error('❌ Error deleting students:', err);
    return res.status(500).json({ message: 'Server error during deletion' });
  }
};


export const sendRejectionMail = async (req, res) => {
  try {
    const { failedStudents } = req.body;


    if (!failedStudents || failedStudents.length === 0) {
      return res.status(400).json({ message: 'No failed students provided' });
    }


    // Filter for valid emails only
    const validRecipients = failedStudents.filter(
      s => typeof s.email === 'string' && s.email.includes('@')
    );


    if (validRecipients.length === 0) {
      console.log("❌ No valid rejection recipients.");
      return res.status(400).json({ message: 'No valid recipients to send rejection emails' });
    }


    await Promise.all(
      validRecipients.map((s) =>
        sendCustomMail(
          [s.email],
          "Student Upload Failed",
          `Dear Student,<br/><br/>We couldn't add you to our portal because: <strong>${s.reason}</strong>.<br/>Please verify your details and try again.<br/><br/>- Admin Team`
        )
      )
    );


    res.status(200).json({ message: 'Rejection emails sent', count: validRecipients.length });
  } catch (err) {
    console.error('Send rejection error:', err);
    res.status(500).json({ message: 'Server error while sending rejection mails' });
  }
};
export const updateAdminCredentials = async (req, res) => {
  const adminId = req.user.id;
  const { newUsername, newPassword } = req.body;


  if (!newUsername || !newPassword) {
    return res.status(400).json({ message: "Username and password are required" });
  }


  try {
    const admin = await User.findById(adminId);


    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied or admin not found' });
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.username = newUsername;
    admin.password = hashedPassword;


    await admin.save();


    res.status(200).json({ message: "Admin credentials updated successfully" });
  } catch (error) {
    console.error('❌ Admin update error:', error);
    res.status(500).json({ message: "Server error during update" });
  }
};
export const updateAdminPhone = async (req, res) => {
  const { phone } = req.body;
  const adminId = req.user.id;


  if (!phone || phone.length !== 10) {
    return res.status(400).json({ message: "Invalid phone number" });
  }


  try {
    const admin = await User.findById(adminId);


    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }


    admin.phone = phone;
    await admin.save();


    res.status(200).json({ message: "Phone number updated successfully" });
  } catch (err) {
    console.error("❌ Phone update error:", err);
    res.status(500).json({ message: "Server error while updating phone" });
  }
};
// PUT /api/admin/update-student/:id
export const updateStudentByAdmin = async (req, res) => {
 
  try {
    const { id } = req.params;
    const {
      name, email, phone,
      cgpa, semester, backlogs,
      gapYears, course, branch,
      tenthPercent, twelfthPercent
    } = req.body;


    const student = await Student.findById(id).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });
    if(!id || id === "undefined"){
    return res.status(400).json({message: "invalid id"});
  }
    // Update user details
    if (name) student.user.name = name;
    if (email) student.user.email = email;
    if (phone) student.user.phone = phone;


    // Update student fields
    if (cgpa !== undefined) student.cgpa = parseFloat(cgpa);
    if (semester !== undefined) student.semester = parseInt(semester);
    if (backlogs !== undefined) student.backlogs = parseInt(backlogs);
    if (gapYears !== undefined) student.gapYears = parseInt(gapYears);
    if (tenthPercent !== undefined) student.tenthPercent = parseFloat(tenthPercent);
    if (twelfthPercent !== undefined) student.twelfthPercent = parseFloat(twelfthPercent);


    // Update course reference by name
    if (course) {
      const courseDoc = await Course.findOne({ name: course });
      if (!courseDoc) return res.status(400).json({ message: "Invalid course name" });
      if (!courseDoc.branches.includes(branch)) {
        return res.status(400).json({ message: "Branch not valid for selected course" });
      }
      student.course = courseDoc._id;
    }


    if (branch) student.branch = branch;


    await student.user.save();
    await student.save();


    res.status(200).json({ message: "Student updated successfully" });
  } catch (err) {
    console.error("❌ Admin update student error:", err);
    res.status(500).json({ message: "Server error while updating student" });
  }
};




export const updateStudentsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file missing." });
    }


    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);


    let updatedCount = 0;


    const capitalizeWords = (str) =>
      str?.trim().split(/\s+/).map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(" ");


    for (const row of rows) {
      const {
        email,
        cgpa,
        backlogs,
        semester,
        firstName,
        lastName,
        course,
        branch,
        gapYears,
        tenthPercent,
        twelfthPercent,
      } = row;


      if (!email) {
        console.warn("Skipping row without email:", row);
        continue;
      }


      const user = await User.findOne({ email });
      if (!user) continue;


      const student = await Student.findOne({ user: user._id });
      if (!student) continue;


      if (cgpa !== undefined) student.cgpa = parseFloat(cgpa);
      if (backlogs !== undefined) student.backlogs = parseInt(backlogs);
      if (semester !== undefined) student.semester = parseInt(semester);
      if (gapYears !== undefined) student.gapYears = parseInt(gapYears);
      if (tenthPercent !== undefined) student.tenthPercent = parseFloat(tenthPercent);
      if (twelfthPercent !== undefined) student.twelfthPercent = parseFloat(twelfthPercent);


      if (firstName && typeof firstName === 'string') {
        student.firstName = capitalizeWords(firstName);
      }


      if (lastName && typeof lastName === 'string') {
        student.lastName = capitalizeWords(lastName);
      }


        if (branch && typeof branch === 'string') {
      const trimmed = branch.trim();
      if (!trimmed.includes(' ') && trimmed.length <= 5) {
        // Abbreviation like "cse" → "CSE"
        student.branch = trimmed.toUpperCase();
      } else {
        // Phrase like "cyber security" → "Cyber Security"
        student.branch = capitalizeWords(trimmed);
      }
    }


      if (course && typeof course === 'string') {
        const formattedCourse = capitalizeWords(course);
        const matchedCourse = await Course.findOne({
          name: new RegExp(`^${formattedCourse}$`, "i"),
        });


        if (!matchedCourse) {
          console.warn(`Course not found for: ${course}`);
          continue;
        }


        student.course = matchedCourse._id;
      }


      await student.save();
      updatedCount++;
    }


    // Cleanup uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete uploaded file:", err);
    });


    res.status(200).json({
      message: `${updatedCount} student(s) updated successfully.`,
    });
  } catch (err) {
    console.error("Excel Update Error:", err);
    res.status(500).json({ message: "Server error during Excel update." });
  }
};






export const sendAdminEmailOTP = async (req, res) => {
  const { newEmail } = req.body;
  const adminId = req.user.id;




  const otp = Math.floor(100000 + Math.random() * 900000).toString();




  try {
    await redis.setEx(`email-otp:${adminId}`, 600, JSON.stringify({ otp, newEmail }));
    await sendOTPEmail(newEmail, otp);
    res.json({ message: 'OTP sent to new email' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};


//adminemailotp


export const verifyAdminEmailOTP = async (req, res) => {
  const { otp } = req.body;
  const adminId = req.user?.id;




  try {
    console.log("📨 Incoming OTP:", otp);
    console.log("🔐 Admin ID from token:", adminId);




    const data = await redis.get(`email-otp:${adminId}`);
    console.log("📦 Redis data fetched:", data);




    if (!data) return res.status(400).json({ message: 'OTP expired or invalid' });




    const { otp: storedOtp, newEmail } = JSON.parse(data);
    console.log("✅ OTP stored:", storedOtp, "| New email:", newEmail);




    if (storedOtp !== otp) return res.status(400).json({ message: 'Incorrect OTP' });




    await User.findByIdAndUpdate(adminId, { email: newEmail });
    await redis.del(`email-otp:${adminId}`);
    // ✅ Send confirmation email
await sendEmailUpdateConfirmation(newEmail);




    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    console.error("❌ OTP Verification Error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// POST /api/admin/send-reminder-mail
export const sendReminderMailToNonApplicants = async (req, res) => {
  try {
    const { students } = req.body;


    if (!students || students.length === 0) {
      return res.status(400).json({ message: "No students provided" });
    }


    const validEmails = students
      .filter((s) => typeof s.email === "string" && s.email.includes("@"))
      .map((s) => s.email);


    if (validEmails.length === 0) {
      return res.status(400).json({ message: "No valid emails to send" });
    }


  await Promise.all(
  students.map((s) =>
    sendCustomMail(
      [s.email],
      "Reminder: Apply for the Job Opportunity",
      `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
          <p>Dear ${s.name || "Student"},</p>
          <p>This is a gentle reminder to apply for the job opportunity before the deadline.</p>
          <p>Wishing you the best!</p>
          <p>– Placement Cell</p>
        </div>
      `
    )
  )
);




    return res.status(200).json({ message: `Reminder sent to ${validEmails.length} students.` });
  } catch (err) {
    console.error("❌ Reminder email error:", err);
    res.status(500).json({ message: "Failed to send reminder email." });
  }
};





