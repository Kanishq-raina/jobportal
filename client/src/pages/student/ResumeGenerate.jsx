// ResumeGenerate.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/StudentComponents/StudentSidebar";
import TopNav from "../../components/StudentComponents/StudentTopNav";
import ResumeForm from "../../components/StudentComponents/ResumeForm";
import ResumeLayout from "../../components/StudentComponents/ResumeLayout";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { getPDFLayout } from "../../components/StudentComponents/ResumeLayout";
import { Toaster, toast } from "react-hot-toast";
import clsx from "clsx";

// ICONS
import skillsIcon from "../../assets/icons/skills.png";
import strengthIcon from "../../assets/icons/strength.png";
import interestsIcon from "../../assets/icons/interests.png";
import educationIcon from "../../assets/icons/education.png";
import workIcon from "../../assets/icons/work.png";
import projectIcon from "../../assets/icons/project.png";
import achievementIcon from "../../assets/icons/achievement.png";
import objectiveIcon from "../../assets/icons/objective.png";

const toBase64 = (url) =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

const generatePDFBlob = async (resumeData) => {
  const blob = await pdf(getPDFLayout(resumeData)).toBlob();
  return blob;
};

const ResumeGenerate = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [canGenerate, setCanGenerate] = useState(false);

  const [objective, setObjective] = useState("");
  const [education, setEducation] = useState([{ institution: "", percentage: "", passingYear: "" }]);
  const [workExperience, setWorkExperience] = useState([{ position: "", company: "", from: "", to: "", bullets: [""] }]);
  const [skills, setSkills] = useState([{ name: "", rating: 3 }]);
  const [projects, setProjects] = useState([{ name: "", description: "" }]);
  const [strengths, setStrengths] = useState([""]);
  const [achievements, setAchievements] = useState([""]);
  const [languages, setLanguages] = useState([""]);
  const [interests, setInterests] = useState([""]);
  const [photo, setPhoto] = useState(null);
  const [address, setAddress] = useState("");
  const [base64Photo, setBase64Photo] = useState(null);
  const [pdfIconData, setPdfIconData] = useState(null); // For PDF only

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("studentToken");
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStudentInfo(data);
        const required = [data.email, data.phone, data.tenthPercent, data.twelfthPercent, data.tenthMarksheet, data.twelfthMarksheet];
        setCanGenerate(required.every(Boolean));
      } else {
        toast.error(data.message || "Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (photo instanceof File) {
      toBase64(URL.createObjectURL(photo)).then(setBase64Photo);
    } else {
      setBase64Photo(photo);
    }
  }, [photo]);

  const loadPDFIcons = async () => {
    const [skills, strength, interests, education, work, project, achievement, objective] = await Promise.all([
      toBase64(skillsIcon),
      toBase64(strengthIcon),
      toBase64(interestsIcon),
      toBase64(educationIcon),
      toBase64(workIcon),
      toBase64(projectIcon),
      toBase64(achievementIcon),
      toBase64(objectiveIcon),
    ]);
    return { skills, strength, interests, education, work, project, achievement, objective };
  };

  const handlePreviewResume = async () => {
    const token = localStorage.getItem("studentToken");
    const res = await fetch("https://jobportal-xqgm.onrender.com/api/student/resume", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setObjective(data.objective || "");
      setAddress(data.address || "");
      setEducation(data.education?.length ? data.education : [{ institution: "", percentage: "", passingYear: "" }]);
      setWorkExperience(data.workExperience?.length ? data.workExperience : [{ position: "", company: "", from: "", to: "", bullets: [""] }]);
      setSkills(data.skills?.length ? data.skills : [{ name: "", rating: 3 }]);
      setProjects(data.projects?.length ? data.projects : [{ name: "", description: "" }]);
      setStrengths(data.strengths?.length ? data.strengths : [""]);
      setAchievements(data.achievements?.length ? data.achievements : [""]);
      setInterests(data.interests?.length ? data.interests : [""]);
      setLanguages(data.languages?.length ? data.languages : [""]);
      setPhoto(data.photo || null);
      toast.success("✅ Resume loaded successfully");
    } else {
      toast.error(data.message || "Failed to fetch saved resume");
    }
  };

  const handleSaveResume = async () => {
    for (const edu of education) {
      const val = edu.percentage;
      const percent = parseFloat(val);
      if (isNaN(percent) || percent < 0 || percent > 100 || !/^\d{1,3}(\.\d{1,2})?$/.test(val)) {
        toast.error("❌ Please enter valid percentages (0-100, up to 2 decimal places) in Education");
        return;
      }
    }

    const token = localStorage.getItem("studentToken");
    const photoDataUrl = photo instanceof File ? await toBase64(URL.createObjectURL(photo)) : photo;

    const icons = await loadPDFIcons();
    setPdfIconData(icons);

    const resumeData = {
      objective,
      education,
      workExperience,
      skills,
      projects,
      strengths,
      achievements,
      interests,
      languages,
      address,
      photo: photoDataUrl,
      contact: {
        name: studentInfo?.name || "",
        email: studentInfo?.email || "",
        phone: studentInfo?.phone || "",
        github: studentInfo?.github || "",
        linkedin: studentInfo?.linkedin || "",
        address,
        photo: photoDataUrl,
      },
      icons,
    };

    try {
      const res = await fetch("https://jobportal-xqgm.onrender.com/api/student/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resumeData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("❌ Failed to save resume: " + (data.message || ""));
        return;
      }

      const blob = await generatePDFBlob(resumeData);
      const formData = new FormData();
      formData.append("resume", blob, "resume.pdf");

      const uploadRes = await fetch("https://jobportal-xqgm.onrender.com/api/student/upload-resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error("❌ PDF upload failed: " + (uploadData.message || ""));
        return;
      }

      toast.success("✅ Resume saved and PDF uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Server error while saving resume");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 md:p-8">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={clsx("flex flex-col flex-1 transition-all duration-300", isCollapsed ? "ml-[72px]" : "ml-24")}>
        <TopNav toggleSidebar={() => setIsCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />
        <Toaster />
        <main className="mt-[72px] px-6 py-10 max-w-6xl mx-auto space-y-8 text-gray-800 dark:text-white">
          <h1 className="text-4xl font-bold">Resume Builder</h1>

          {!canGenerate && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              Complete your profile (phone, email, 10th/12th % and marksheets) before downloading resume.
            </div>
          )}

          <ResumeForm
            objective={objective} setObjective={setObjective}
            education={education} setEducation={setEducation}
            workExperience={workExperience} setWorkExperience={setWorkExperience}
            skills={skills} setSkills={setSkills}
            projects={projects} setProjects={setProjects}
            strengths={strengths} setStrengths={setStrengths}
            achievements={achievements} setAchievements={setAchievements}
            languages={languages} setLanguages={setLanguages}
            interests={interests} setInterests={setInterests}
            photo={photo} setPhoto={setPhoto}
            address={address} setAddress={setAddress}
          />

          <div className="flex gap-4 no-print">
            <button onClick={handleSaveResume} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              📂 Save Resume
            </button>

           {pdfIconData && base64Photo && (
  <PDFDownloadLink
    document={getPDFLayout({
      contact: {
        name: studentInfo?.name || "",
        email: studentInfo?.email || "",
        phone: studentInfo?.phone || "",
        github: studentInfo?.github || "",
        linkedin: studentInfo?.linkedin || "",
        address,
        photo: base64Photo,
      },
      objective,
      education,
      workExperience,
      skills,
      projects,
      strengths,
      achievements,
      interests,
      icons: pdfIconData,
    })}
    fileName="resume.pdf"
    style={{ textDecoration: "none" }}
  >
    {({ loading, url }) =>
      loading ? "Generating..." : (
        <a
          href={url}
          download="resume.pdf"
          onClick={() => setTimeout(() => window.location.reload(), 1500)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          📄 Download Styled PDF
        </a>
      )
    }
  </PDFDownloadLink>
)}


            <button onClick={handlePreviewResume} className="px-6 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
              📄 Preview Saved Resume
            </button>
          </div>

          <div id="resume-preview" className="p-4 bg-white rounded-xl shadow-lg text-sm leading-relaxed">
            <ResumeLayout
              contact={{
                name: studentInfo?.name || "",
                email: studentInfo?.email || "",
                phone: studentInfo?.phone || "",
                github: studentInfo?.github || "",
                linkedin: studentInfo?.linkedin || "",
                address,
                photo,
              }}
              objective={objective}
              education={education}
              workExperience={workExperience}
              skills={skills}
              projects={projects}
              strengths={strengths}
              achievements={achievements}
              languages={languages}
              interests={interests}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumeGenerate;
