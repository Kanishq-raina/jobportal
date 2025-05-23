// server/controllers/studentController.js
import Student from "../models/Student.js";
import User from "../models/user.js";

export const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const student = await Student.findOne({ user: userId });

    if (!student) {
      return res.status(404).json({ message: "Student details not found" });
    }

    res.json({
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      branch: student.branch,
      cgpa: student.cgpa,
      semester: student.semester,
      github: student.github,
      linkedin: student.linkedin,
      skills: student.skills,
      projects: student.projects,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
