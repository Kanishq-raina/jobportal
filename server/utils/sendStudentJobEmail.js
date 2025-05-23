import nodemailer from 'nodemailer';

export const sendStudentJobEmail = async (email, username, job, jobLink = null, isIncompleteProfile = false) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const subject = isIncompleteProfile
    ? `⚠️ Action Needed: Complete Your Profile to Apply for ${job.title}`
    : `📢 New Job Opportunity: ${job.title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <h2 style="color: ${isIncompleteProfile ? '#D97706' : '#4F46E5'};">
        ${isIncompleteProfile ? '🔒 Profile Incomplete!' : `🚀 New Job Alert for You, ${username}!`}
      </h2>

      ${
        isIncompleteProfile
          ? `
        <p>Hello ${username},</p>
        <p>You meet the eligibility criteria for the job <strong>${job.title}</strong>, but it looks like your profile is missing one or more of the following:</p>
        <ul>
          <li>✅ 10th Marksheet</li>
          <li>✅ 12th Marksheet</li>
          <li>✅ Resume</li>
        </ul>
        <p style="margin-top: 10px;">To apply for this job and others in the future, please <strong>update your profile</strong> with the required documents.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/" style="display: inline-block; margin-top: 20px; padding: 10px 18px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px;">
            Update Your Profile
          </a>
        </p>
        `
          : `
        <p>You are eligible to apply for the following job:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">📝 Title:</td><td style="padding: 8px;">${job.title}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">💼 Description:</td><td style="padding: 8px;">${job.description}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">💰 Salary:</td><td style="padding: 8px;">₹${job.salary} LPA</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">📅 Deadline:</td><td style="padding: 8px;">${new Date(job.deadline).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">🎓 Min CGPA:</td><td style="padding: 8px;">${job.eligibility.minCGPA}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">📚 Max Backlogs:</td><td style="padding: 8px;">${job.eligibility.maxBacklogs}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">⏳ Allowed Gap Years:</td><td style="padding: 8px;">${job.eligibility.allowedGapYears}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">📅 Semesters Allowed:</td><td style="padding: 8px;">${job.eligibility.semestersAllowed.join(', ')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">🌳 Branches Allowed:</td><td style="padding: 8px;">${job.eligibility.branchesAllowed.join(', ')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">🎓 Courses Allowed:</td><td style="padding: 8px;">${job.coursesAllowed.join(', ')}</td></tr>
        </table>
        <p style="margin-top: 20px;">Click the link below to apply:</p>
        <p>
          <a href="${jobLink}" target="_blank"
            style="display: inline-block; padding: 12px 20px; background-color: #22c55e; color: white; font-weight: bold; border-radius: 6px; text-decoration: none;">
            ✅ Apply Now
          </a>
        <p style="margin-top: 10px;">📌 <strong>Note:</strong> Apply only if you're genuinely interested.</p>
        `
      }

      <hr style="margin-top: 30px;" />
      <p style="font-size: 0.9em; color: #888;">Sent by Job Portal Team</p>
    </div>
  `;

  const mailOptions = {
    from: `"Job Portal" <${process.env.MAIL_USERNAME}>`,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
