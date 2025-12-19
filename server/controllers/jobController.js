import Job from '../models/job.js';
import Student from '../models/Student.js';
import { sendStudentJobEmail } from '../utils/sendStudentJobEmail.js';
import xlsx from 'xlsx';
import Application from '../models/Application.js';
import crypto from 'crypto';
import JobToken from '../models/JobToken.js';


export const createJob = async (req, res) => {
  const generateJobToken = () => crypto.randomBytes(32).toString("hex");
  try {
    console.log("📥 Received user from middleware:", req.user);


    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Missing admin user' });
    }


    const {
      title,
      description,
      salary,
      vacancy,
      deadline,
      minCGPA,
      maxBacklogs,
      allowedGapYears,
      semestersAllowed,
      branchesAllowed,
      coursesAllowed ,
      minTenthPercent,
      minTwelfthPercent,// ✅ NEW
    } = req.body;


    // 👇 Handle parsing
    const parsedSemesters = Array.isArray(semestersAllowed)
      ? semestersAllowed.map(Number)
      : Array.from({ length: 11 - parseInt(semestersAllowed) }, (_, i) => i + parseInt(semestersAllowed));


    const parsedBranches = typeof branchesAllowed === 'string'
      ? JSON.parse(branchesAllowed)
      : branchesAllowed;


    const parsedCourses = typeof coursesAllowed === 'string'
      ? JSON.parse(coursesAllowed)
      : coursesAllowed;


    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : '';
    const allowedGapYearsValue = allowedGapYears !== '' ? parseInt(allowedGapYears) : 0;
    const maxBacklogsValue = maxBacklogs !== '' ? parseInt(maxBacklogs) : 0;


    const job = new Job({
      title,
      description,
      salary: parseFloat(salary),
      vacancy: parseInt(vacancy),
      deadline,
      logo: logoPath,
      createdBy: req.user.id,
      coursesAllowed: parsedCourses,
      branchesAllowed: parsedBranches, // ✅ NEW
      eligibility: {
        minCGPA: parseFloat(minCGPA),
        maxBacklogs: maxBacklogs,
        allowedGapYears: allowedGapYears,
        semestersAllowed: parsedSemesters,
        branchesAllowed: parsedBranches,
        minTenthPercent: parseInt(minTenthPercent),
        minTwelfthPercent: parseInt(minTwelfthPercent),
      }
    });


    await job.save();


    // ✅ Fetch eligible students
    const allStudents = await Student.find().populate('user').populate('course'); // ✅ updated


    const eligibleStudents = [];
    for (const student of allStudents) {
      const courseName = student.course?.name; // ✅ NEW
      const isEligible =
        parsedCourses.includes(courseName) &&
        student.tenthPercent >= job.eligibility.minTenthPercent &&
        student.twelfthPercent >= job.eligibility.minTwelfthPercent && // ✅ NEW check
        student.cgpa >= job.eligibility.minCGPA &&
        student.backlogs <= job.eligibility.maxBacklogs &&
        student.gapYears <= job.eligibility.allowedGapYears &&
        job.eligibility.semestersAllowed.includes(student.semester) &&
        job.eligibility.branchesAllowed.includes(student.branch);


      console.log(`🔍 Checking student ${student.user?.username || "?"} => Eligible:`, isEligible);


      if (isEligible) eligibleStudents.push(student);
    }


    // ✉️ Send email notifications
    for (const student of eligibleStudents) {
      if (student.user?.email) {
        try {
          const hasAllDocuments =
            student.tenthMarksheet && student.twelfthMarksheet && student.resumeLink;
   
          if (hasAllDocuments) {
            const jobToken = generateJobToken();
            const jobLink = `${process.env.FRONTEND_URL}/applytojob?token=${jobToken}`;
            await JobToken.create({
              token: jobToken,
              jobId: job._id,
              studentId: student.user._id,
              expiry: Date.now() + 1000 * 60 * 60 * 24,
            });
            await sendStudentJobEmail(student.user.email, student.user.username, job, jobLink);
          } else {
            const message = `
              Hi ${student.user.username},
   
              You are eligible for the job "${job.title}", but we noticed that your profile is missing one or more required documents (10th/12th marksheet or resume).
   
              Please update your profile with the necessary documents to receive job application links in the future.
   
              Visit: ${process.env.FRONTEND_URL}/;
            `;
            await sendStudentJobEmail(student.user.email, student.user.username, job, null, message);
          }
   
        } catch (err) {
          console.warn(`❌ Failed to send to ${student.user.email}: ${err.message}`);
        }
      }
    }
   


    res.status(201).json({
      message: '✅ Job created and eligible students notified',
      job,
      notified: eligibleStudents.length,
    });


  } catch (err) {
    console.error('❌ Job creation error:', err);
    res.status(500).json({ message: 'Server error while creating job' });
  }
};
export const uploadJobsFromExcel = async (req, res) => {
  const generateJobToken = () => crypto.randomBytes(32).toString("hex");
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file missing." });
    }


    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jobs = xlsx.utils.sheet_to_json(sheet);


    let createdCount = 0;


    for (const jobData of jobs) {
      try {
        if (
          !jobData.title || !jobData.description ||
          typeof jobData.salary !== 'number' || jobData.salary < 1 ||
          typeof jobData.vacancy !== 'number' || jobData.vacancy < 1 ||
          !jobData.deadline || isNaN(new Date(jobData.deadline)) ||
          typeof jobData.minCGPA !== 'number' ||
          typeof jobData.maxBacklogs !== 'number' ||
          typeof jobData.allowedGapYears !== 'number' ||
          typeof jobData.minTenthPercent !== 'number' ||
          typeof jobData.minTwelfthPercent !== 'number' ||


          !jobData.branchesAllowed || !jobData.coursesAllowed // ✅ NEW required field
        ) {
          console.log('Skipping invalid job:', jobData);
          continue;
        }


        const newJob = new Job({
          title: jobData.title,
          description: jobData.description,
          salary: jobData.salary,
          vacancy: jobData.vacancy,
          deadline: new Date(jobData.deadline),
          logo: '',
          createdBy: req.user.id,
          coursesAllowed: jobData.coursesAllowed.split(',').map(c => c.trim()), // ✅ NEW
          eligibility: {
            minCGPA: jobData.minCGPA,
            maxBacklogs: jobData.maxBacklogs,
            allowedGapYears: jobData.allowedGapYears,
            semestersAllowed: [jobData.semestersAllowed],
            minTenthPercent: jobData.minTenthPercent,
            minTwelfthPercent: jobData.minTwelfthPercent,
            branchesAllowed: jobData.branchesAllowed.split(',').map(b => b.trim()),
          }
        });


        await newJob.save();
        createdCount++;


        // ✅ Find eligible students properly
        const allStudents = await Student.find().populate('user').populate('course'); // ✅ updated


        const eligibleStudents = allStudents.filter(student => {
          const courseName = student.course?.name;
          return (
            newJob.coursesAllowed.includes(courseName) && // ✅ check course match
            student.cgpa >= newJob.eligibility.minCGPA &&
            student.backlogs <= newJob.eligibility.maxBacklogs &&
            student.gapYears <= newJob.eligibility.allowedGapYears &&
            student.tenthPercent >= newJob.eligibility.minTenthPercent &&
            student.twelfthPercent >= newJob.eligibility.minTwelfthPercent &&
            newJob.eligibility.semestersAllowed.includes(student.semester) &&
            newJob.eligibility.branchesAllowed.includes(student.branch)
          );
        });


        for (const student of eligibleStudents) {
          if (student.user?.email) {
            const hasAllDocuments =
            student.tenthMarksheet && student.twelfthMarksheet && student.resumeLink;
         
          if (hasAllDocuments) {
            const jobToken = generateJobToken();
            const jobLink = `${process.env.FRONTEND_URL}/applytojob?token=${jobToken}`;
            await JobToken.create({
              token: jobToken,
              jobId: job._id,
              studentId: student.user._id,
              expiry: Date.now() + 1000 * 60 * 60 * 24,
            });
            await sendStudentJobEmail(student.user.email, student.user.username, newJob, jobLink);
          } else {
            const message = `
              Hi ${student.user.username},
         
              You are eligible for the job "${newJob.title}", but your profile is missing required documents (10th/12th marksheet or resume).
         
              Please update your profile to receive job application links in the future.
         
              Visit: ${process.env.FRONTEND_URL}/;
            `;
            await sendStudentJobEmail(student.user.email, student.user.username, newJob, null, message);
          }
         
          }
        }


      } catch (err) {
        console.error('Skipping invalid job due to error:', jobData, err.message);
        continue;
      }
    }


    res.status(200).json({ message: "Jobs upload completed", createdCount });


  } catch (err) {
    console.error("Excel upload error:", err);
    res.status(500).json({ message: "Server error processing Excel file" });
  }
};


export const getAllJobs = async (req, res) => {
  try {
    // ✅ Step 1: Update expired jobs before returning list
    await Job.updateMany(
      { status: "active", deadline: { $lt: new Date() } },
      { $set: { status: "inactive" } }
    );

    // ✅ Step 2: Fetch updated jobs list
    const jobs = await Job.find().sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await Job.findByIdAndDelete(id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
};
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, salary, vacancy, deadline, description } = req.body;


    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { title, salary, vacancy, deadline, description },
      { new: true }
    );


    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }


    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
};




export const getJobApplicants = async (req, res) => {
  try {
    const { id: jobId } = req.params;

    // Fetch all applications for this job with roundStatus
    const applications = await Application.find({ job: jobId })
      .select('status student roundStatus')
      .populate('student', 'name email phone course branch semester');

const appliedUserIds = applications
  .filter(app => app.student && app.student._id)
  .map(app => app.student._id.toString());


    // Fetch all students and their user info
 const students = await Student.find()
  .populate('user', 'name email phone')
  .populate('course', 'name') // ✅ This is the key fix
  .lean();


    const merged = students.map((s) => {
      const applied = appliedUserIds.includes(s.user._id.toString());
 const matchingApplication = applications.find(app =>
  app.student && app.student._id && app.student._id.toString() === s.user._id.toString()
);


      const isFinalSelected = matchingApplication?.roundStatus?.final === 'selected';

      return {
        _id: s._id,
        name: s.user?.name || '',
        email: s.user?.email || '',
        phone: s.user?.phone || '',
        course: s.course?.name || '',
        cgpa: s.cgpa,
        branch: s.branch,
        semester: s.semester,
        backlogs: s.backlogs || 0,
        skills: s.skills || [],
        resume: s.resumeLink || '',
        hasApplied: applied,
        applicationStatus: matchingApplication?.status || null,
        selectedInFinalRound: isFinalSelected
      };
    });
    
  const totalStudents = students.length;
    const studentsApplied = appliedUserIds.length;
    const studentsNotApplied = totalStudents - studentsApplied;

    res.status(200).json({
      applicants: merged,
      stats: {
        totalStudents,
        studentsApplied,
        studentsNotApplied
      }
    });
  } catch (error) {
    console.error("❌ Error fetching applicants:", error);
    res.status(500).json({ message: "Error fetching applicants" });
  }
};






export const updateApplicantStatus = async (req, res) => {
  try {
    const { id: jobId, studentId, action } = req.params;


    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }


    const application = await Application.findOne({ job: jobId, student: studentId });


    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }


    application.status = action === 'accept' ? 'accepted' : 'rejected';
    await application.save();


    res.status(200).json({ message: `Applicant ${action}ed successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating applicant" });
  }
};





