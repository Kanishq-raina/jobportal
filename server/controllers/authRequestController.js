// server/controllers/authRequestController.js
import AuthRequest from "../models/AuthRequest.js";
import Student from "../models/Student.js";
import User from "../models/user.js";

export const submitAuthRequest = async (req, res) => {
  try {
    const { field, newValue } = req.body;
    const proof = req.file?.path || "";

    const studentData = await Student.findOne({ user: req.user.id });
    if (!studentData) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!["cgpa", "semester", "branch", "tenthPercent", "twelfthPercent", "backlogs"].includes(field)) {
      return res.status(400).json({ message: "Invalid field" });
    }

    const oldValue = studentData[field];

    const request = new AuthRequest({
      student: studentData._id,
      field,
      newValue,
      oldValue,
      proof,
    });

    await request.save();

    res.status(201).json({ message: "Auth request submitted successfully" });
  } catch (err) {
    console.error("❌ Error submitting auth request:", err);
    res.status(500).json({ message: "Server error while submitting request" });
  }
};











export const getAllAuthRequests = async (req, res) => {
 try {
   const requests = await AuthRequest.find()
     .populate({
       path: "student",
       model: "Student",
       populate: {
         path: "user",
         model: "User",
         select: "name email", // ✅ only fetch required fields
       },
     })
     .sort({ createdAt: -1 });


   res.status(200).json(requests);
 } catch (err) {
   console.error("❌ Fetch Auth Requests Error:", err);
   res.status(500).json({ message: "Failed to fetch auth requests" });
 }
};





export const approveAuthRequest = async (req, res) => {
 try {
   const request = await AuthRequest.findById(req.params.id);
   if (!request || request.status !== "pending") {
     return res.status(404).json({ message: "Request not found or already handled" });
   }


   const student = await Student.findById(request.student);
   if (!student) return res.status(404).json({ message: "Student not found" });


   const field = request.field;
   const value = isNaN(request.newValue) ? request.newValue : parseFloat(request.newValue);


   student[field] = value;
   await student.save();


   request.status = "approved";
   await request.save();


   res.status(200).json({ message: "Request approved and student updated" });
 } catch (err) {
   console.error("❌ Approve request error:", err);
   res.status(500).json({ message: "Server error during approval" });
 }
};





export const rejectAuthRequest = async (req, res) => {
 try {
   const request = await AuthRequest.findById(req.params.id);
   if (!request) return res.status(404).json({ message: "Request not found" });


   // ✅ Only update allowed fields (don't touch oldValue!)
   request.status = "rejected";
   request.remarks = req.body.feedback || "";


   await request.save();


   res.status(200).json({ message: "Request rejected" });
 } catch (err) {
   console.error("❌ Reject Error:", err);
   res.status(500).json({ message: "Internal server error" });
 }
};
export const deleteAuthRequest = async (req, res) => {
 try {
   const request = await AuthRequest.findByIdAndDelete(req.params.id);
   if (!request) {
     return res.status(404).json({ message: "Request not found" });
   }


   res.status(200).json({ message: "Request deleted successfully" });
 } catch (err) {
   console.error("❌ Delete request error:", err);
   res.status(500).json({ message: "Server error while deleting request" });
 }
};






