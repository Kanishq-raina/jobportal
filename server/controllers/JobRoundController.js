import xlsx from "xlsx";
import JobRound from "../models/JobRound.js";
import Application from "../models/Application.js";
import User from "../models/user.js"; // if needed
import { sendCustomMail } from "../utils/sendCustomMail.js";
import Job from "../models/job.js";


export const uploadRoundResults = async (req, res) => {
  const { jobId, roundType } = req.params;
  const filePath = req.file?.path;


  if (!filePath) return res.status(400).json({ message: "Excel file required" });


  try {
    // ✅ Read emails from Excel
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    const emails = data.map(d => d.email?.toLowerCase().trim()).filter(Boolean);


    const users = await User.find({ email: { $in: emails } });
    const selectedUserIds = users.map(u => u._id);


    // ✅ Save round
    const round = await JobRound.findOneAndUpdate(
      { job: jobId, roundType },
      {
        selectedStudents: selectedUserIds,
        resultFile: filePath,
        mailSent: false,
      },
      { upsert: true, new: true }
    );


    // ✅ Update selected students' Application
    for (const userId of selectedUserIds) {
      const updateFields = {
        [`roundStatus.${roundType}`]: "selected"
      };


      if (roundType === "final") {
        updateFields.status = "accepted";
      }


      await Application.findOneAndUpdate(
        { job: jobId, student: userId },
        updateFields
      );
    }


    // ✅ Update rejected students
    const rejectedApps = await Application.find({
      job: jobId,
      student: { $nin: selectedUserIds },
      [`roundStatus.${roundType}`]: "pending"
    }).populate("student", "email");


    const rejectedEmails = [];


    for (const app of rejectedApps) {
      app.roundStatus[roundType] = "rejected";


      if (roundType === "final") {
        app.status = "rejected"; // ✅ final round = hard rejection
      }


      await app.save();


      const user = await User.findById(app.student);
      if (user?.email) rejectedEmails.push(user.email);
    }


    // ✅ Send rejection emails
    if (rejectedEmails.length > 0) {
      await sendCustomMail(
        rejectedEmails,
        `Not Selected for ${roundType.toUpperCase()} Round`,
        `We regret to inform you that you have not been selected for the <strong>${roundType.toUpperCase()}</strong> round of the recruitment process.<br><br>– Placement Team`
      );
    }


    // ✅ Immediately mark job as taken after final round
    if (roundType === "final") {
      await Job.findByIdAndUpdate(jobId, { status: "taken" });
    }


    res.status(200).json({
      message: "Round results processed",
      round,
      rejectedCount: rejectedEmails.length
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};




export const getRoundsForJob = async (req, res) => {
  const { jobId } = req.params;


  try {
    const rounds = await JobRound.find({ job: jobId }).populate({
      path: "selectedStudents",
      select: "name email phone", // from User
      populate: {
        path: "student", // get linked Student document
        model: "Student",
        select: "cgpa branch semester backlogs course", // from Student
        populate: {
          path: "course", // course is a ref in Student model
          model: "Course",
          select: "name", // get only course name
        },
      },
    });


    res.status(200).json(rounds);
  } catch (err) {
    console.error("Failed to fetch rounds:", err);
    res.status(500).json({ message: "Failed to fetch rounds" });
  }
};




export const sendRoundEmails = async (req, res) => {
  const { jobId, roundType } = req.params;


  try {
    const round = await JobRound.findOne({ job: jobId, roundType });
    if (!round || !round.selectedStudents.length) {
      return res.status(404).json({ message: "No selected students found for this round." });
    }


    const users = await User.find({ _id: { $in: round.selectedStudents } });
    const emails = users.map(user => user.email);


    // Customize subject and message based on roundType
    const subject = roundType === "final"
      ? `🎉 Congratulations! You've been Selected for the Job`
      : `Selected for ${roundType.toUpperCase()} Round`;


    const message = roundType === "final"
      ? `Congratulations! You have been selected for the job. We appreciate your performance and wish you all the best in your new role.<br><br>– Placement Team`
      : `You have been selected for the <strong>${roundType.toUpperCase()}</strong> round. Please await further instructions.<br><br>– Placement Team`;


    await sendCustomMail(emails, subject, message);


    round.mailSent = true;
    await round.save();


    res.status(200).json({ message: "Emails sent successfully." });
  } catch (err) {
    console.error("Error sending round emails:", err);
    res.status(500).json({ message: "Failed to send emails.", error: err.message });
  }
};







