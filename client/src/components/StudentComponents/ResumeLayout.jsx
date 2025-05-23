import React from "react";
import {
 FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin,
 FiStar, FiBook, FiBriefcase, FiAward, FiActivity, FiUserCheck
} from "react-icons/fi";


const RatingCircles = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => {
      const isFull = i < Math.floor(rating);
      const isHalf = rating % 1 !== 0 && i === Math.floor(rating);

      return (
        <div
          key={i}
          className={`w-3 h-3 rounded-full border-2 relative overflow-hidden ${
            isFull || isHalf ? "border-white" : "border-white"
          }`}
        >
          {isFull && <div className="w-full h-full bg-white rounded-full" />}
          {isHalf && (
            <div className="w-1/2 h-full bg-white absolute left-0 top-0 rounded-l-full" />
          )}
        </div>
      );
    })}
  </div>
);



const formatDuration = (from, to) => {
 if (!from || !to) return "";
 const start = new Date(from);
 const end = new Date(to);
 const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
 const years = Math.floor(months / 12);
 const remMonths = months % 12;
 return `${years ? years + " yr" : ""}${remMonths ? " " + remMonths + " mo" : ""}`;
};


const ResumeLayout = ({
 contact,
 objective,
 education,
 workExperience,
 skills,
 projects,
 strengths,
 achievements,
 interests,
}) => {
 return (
   <div className="w-full min-h-[297mm] print:bg-white print:text-black text-black bg-white font-sans">
     <div className="grid grid-cols-3 w-full h-full">
       {/* Sidebar */}
       <div className="col-span-1 bg-[#9e3f33] text-white p-6 space-y-6 print:bg-white print:text-black print:border-r print:border-gray-300">
         <div className="text-center">
           <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white print:border-gray-500">
             {contact.photo ? (
               <img
                 src={typeof contact.photo === "string" ? contact.photo : URL.createObjectURL(contact.photo)}
                 alt="Profile"
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-xs">
                 No Photo
               </div>
             )}
           </div>
           <h1 className="text-2xl font-bold uppercase leading-tight">{contact.name || "Your Name"}</h1>
         </div>


         {/* Contact Info */}
         <div className="space-y-2 text-sm font-semibold">
           {contact.email && <p className="flex items-center gap-2"><FiMail /> {contact.email}</p>}
           {contact.phone && <p className="flex items-center gap-2"><FiPhone /> {contact.phone}</p>}
           {contact.address && <p className="flex items-center gap-2"><FiMapPin /> {contact.address}</p>}
           {contact.linkedin && <p className="flex items-center gap-2"><FiLinkedin /> {contact.linkedin}</p>}
           {contact.github && <p className="flex items-center gap-2"><FiGithub /> {contact.github}</p>}
         </div>


         {/* Skills */}
         {skills?.some(skill => skill.name) && (
           <div>
             <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><FiStar /> Skills</h2>
             <div className="space-y-2">
               {skills.map((s, i) =>
                 s.name && (
                   <div key={i} className="flex justify-between items-center text-sm">
                     <span>{s.name}</span>
                     <RatingCircles rating={s.rating} />
                   </div>
                 )
               )}
             </div>
           </div>
         )}


         {/* Interests */}
         {interests?.some(i => i.trim() !== "") && (
           <div>
             <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><FiActivity /> Interests</h2>
             <ul className="grid grid-cols-2 gap-2 text-sm list-none">
               {interests.map((int, i) =>
                 int.trim() && <li key={i} className="flex items-center gap-2">{int}</li>
               )}
             </ul>
           </div>
         )}


         {/* Strengths */}
         {strengths?.some(s => s.trim() !== "") && (
           <div>
             <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><FiUserCheck /> Strengths</h2>
             <div className="flex flex-wrap gap-2 text-xs">
               {strengths.map((s, i) =>
                 s.trim() && <span key={i} className="px-2 py-1 bg-white text-[#9e3f33] font-semibold rounded print:bg-transparent print:text-black">{s}</span>
               )}
             </div>
           </div>
         )}
       </div>


       {/* Main Content */}
       <div className="col-span-2 bg-white p-8 space-y-6 print:p-6">
         {/* Work Experience */}
         {workExperience?.some(w => w.position || w.company || w.bullets.some(b => b.trim())) && (
           <div className="break-after-page print:break-after-page">
             <h2 className="text-xl font-bold text-[#9e3f33] flex items-center gap-2 mb-2 print:text-black"><FiBriefcase /> Work Experience</h2>
             {workExperience.map((exp, idx) => (
               <div key={idx} className="mb-4">
                 <h3 className="font-semibold">{exp.position}</h3>
                 <p className="text-sm text-red-500 print:text-black">{exp.company}</p>
                 <p className="text-xs text-gray-500 italic">
                   {exp.from} – {exp.to} ({formatDuration(exp.from, exp.to)})
                 </p>
                 <ul className="list-disc list-inside text-sm mt-1 text-gray-800 print:text-black">
                   {exp.bullets.map((point, i) =>
                     point && <li key={i}>{point}</li>
                   )}
                 </ul>
               </div>
             ))}
           </div>
         )}


         {/* Education */}
         {education?.some(e => e.institution || e.passingYear || e.percentage) && (
           <div className="break-after-page print:break-after-page">
             <h2 className="text-xl font-bold text-[#9e3f33] flex items-center gap-2 mb-4 print:text-black"><FiBook /> Education</h2>
             <table className="w-full table-auto text-sm border border-gray-300 print:border-gray-500">
               <thead className="bg-gray-100 print:bg-transparent">
                 <tr>
                   <th className="p-2 border">Institution Name</th>
                   <th className="p-2 border">Passing Year</th>
                   <th className="p-2 border">Passing Percentage</th>
                 </tr>
               </thead>
               <tbody>
                 {education.map((edu, idx) =>
                   (edu.institution || edu.passingYear || edu.percentage) && (
                     <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 print:bg-transparent"}>
                       <td className="p-2 border">{edu.institution}</td>
                       <td className="p-2 border">{edu.passingYear}</td>
                       <td className="p-2 border">{edu.percentage}%</td>
                     </tr>
                   )
                 )}
               </tbody>
             </table>
           </div>
         )}


         {/* Projects */}
         {projects?.some(p => p.name || p.description) && (
           <div>
             <h2 className="text-xl font-bold text-[#9e3f33] flex items-center gap-2 mb-2 print:text-black"><FiAward /> Projects</h2>
             {projects.map((proj, idx) =>
               (proj.name || proj.description) && (
                 <div key={idx} className="mb-2">
                   <h3 className="font-semibold">{proj.name}</h3>
                   <p className="text-sm text-gray-800 print:text-black">{proj.description}</p>
                 </div>
               )
             )}
           </div>
         )}


         {/* Achievements */}
         {achievements?.some(a => a.trim()) && (
           <div>
             <h2 className="text-xl font-bold text-[#9e3f33] flex items-center gap-2 mb-2 print:text-black"><FiAward /> Achievements</h2>
             <ul className="list-disc list-inside text-sm text-gray-800 print:text-black">
               {achievements.map((a, i) =>
                 a.trim() && <li key={i}>{a}</li>
               )}
             </ul>
           </div>
         )}


         {/* Career Objective */}
         {objective && objective.trim() !== "" && (
           <div>
             <h2 className="text-xl font-bold text-[#9e3f33] flex items-center gap-2 mb-2 print:text-black"><FiUserCheck /> Career Objective</h2>
             <p className="text-sm text-gray-800 print:text-black">{objective}</p>
           </div>
         )}
       </div>
     </div>


     {/* Footer */}
     <div className="text-center text-xs text-gray-400 mt-6 print:mt-10 print:text-gray-500">
       Generated using College Resume Builder © {new Date().getFullYear()}
     </div>
   </div>
 );
};



export default ResumeLayout;

// Updated getPDFLayout with image-based icons, fixed Education table, and no mid-item breaks

// Updated getPDFLayout to accept icon props for local asset usage

import {
  Document, Page, View, Text, StyleSheet, Image as PDFImage
} from '@react-pdf/renderer';

const safeImage = (src) => typeof src === 'string' && src.startsWith('data:image') ? src : null;

const getDuration = (from, to) => {
  try {
    const start = new Date(from);
    const end = new Date(to);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return `${from} – ${to} (${years ? `${years} yr${years > 1 ? 's' : ''}` : ''}${years && remMonths ? ' ' : ''}${remMonths ? `${remMonths} mo${remMonths > 1 ? 's' : ''}` : ''})`;
  } catch {
    return '';
  }
};

const DotRating = ({ rating }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[...Array(5)].map((_, i) => {
      const isFull = i < Math.floor(rating);
      const isHalf = i === Math.floor(rating) && rating % 1 !== 0;
      return (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#000000',
            backgroundColor: isFull ? '#820000' : 'transparent',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {isHalf && (
            <View style={{
              width: '50%',
              height: '100%',
              backgroundColor: '#820000',
              position: 'absolute',
              left: 0,
              top: 0,
            }} />
          )}
        </View>
      );
    })}
  </View>
);

const Icon = ({ src }) =>
  typeof src === "string" && src.startsWith("data:image")
    ? <PDFImage src={src} style={{ width: 12, height: 12, marginRight: 6 }} />
    : null;

export const getPDFLayout = ({
  contact,
  objective,
  education,
  workExperience,
  skills,
  projects,
  strengths,
  achievements,
  interests,
  icons
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {safeImage(contact.photo) && <PDFImage src={contact.photo} style={styles.photo} />}
          <Text style={styles.name}>{contact.name?.toUpperCase() || 'YOUR NAME'}</Text>
          {contact.email && <Text style={styles.info}>{contact.email}</Text>}
          {contact.phone && <Text style={styles.info}>{contact.phone}</Text>}
          {contact.address && <Text style={styles.info}>{contact.address}</Text>}

          {skills?.some(s => s.name) && (
            <View style={styles.sidebarSection}>
              <View style={styles.headingRow}>
                <Icon src={icons.skills} />
                <Text style={styles.sidebarHeading}>SKILLS</Text>
              </View>
              {skills.map((s, i) =>
                s.name && (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={styles.boldWhite}>{s.name}</Text>
                    <DotRating rating={s.rating} />
                  </View>
                )
              )}
            </View>
          )}

          {strengths?.some(s => s.trim()) && (
            <View style={styles.sidebarSection}>
              <View style={styles.headingRow}>
                <Icon src={icons.strength} />
                <Text style={styles.sidebarHeading}>STRENGTHS</Text>
              </View>
              <View style={styles.strengthContainer}>
                {strengths.map((s, i) => s.trim() && <Text key={i} style={styles.strength}>{s}</Text>)}
              </View>
            </View>
          )}

          {interests?.some(s => s.trim()) && (
            <View style={styles.sidebarSection}>
              <View style={styles.headingRow}>
                <Icon src={icons.interests} />
                <Text style={styles.sidebarHeading}>INTERESTS</Text>
              </View>
              <View style={styles.strengthContainer}>
                {interests.map((s, i) => s.trim() && <Text key={i} style={styles.strength}>{s}</Text>)}
              </View>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {education?.some(e => e.institution) && (
            <View style={styles.section}>
              <View style={styles.headingRow}>
                <Icon src={icons.education} />
                <Text style={styles.mainTitle}>EDUCATION</Text>
              </View>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableColHeader}>Institution Name</Text>
                  <Text style={styles.tableColHeader}>Passing Year</Text>
                  <Text style={styles.tableColHeader}>Percentage</Text>
                </View>
                {education.map((edu, i) => (
                  <View key={i} style={styles.tableRow} wrap={false}>
                    <Text style={styles.tableCol}>{edu.institution}</Text>
                    <Text style={styles.tableCol}>{edu.passingYear}</Text>
                    <Text style={styles.tableCol}>{edu.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {workExperience?.some(e => e.position || e.company) && (
            <View style={styles.section}>
              <View style={styles.headingRow}>
                <Icon src={icons.work} />
                <Text style={styles.mainTitle}>WORK EXPERIENCE</Text>
              </View>
              {workExperience.map((exp, i) => (
                <View key={i} style={styles.item} wrap={false}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.date}>{getDuration(exp.from, exp.to)}</Text>
                  </View>
                  <Text style={styles.companyText}>{exp.company}</Text>
                  {exp.bullets?.map((b, j) => b?.trim() && <Text key={j} style={styles.bullet}>• {b}</Text>)}
                </View>
              ))}
            </View>
          )}

          {projects?.some(p => p.name || p.description) && (
            <View style={styles.section}>
              <View style={styles.headingRow}>
                <Icon src={icons.project} />
                <Text style={styles.mainTitle}>PROJECTS</Text>
              </View>
              {projects.map((proj, i) => (
                <View key={i} style={styles.item} wrap={false}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  <Text style={styles.text}>{proj.description}</Text>
                </View>
              ))}
            </View>
          )}

          {achievements?.some(a => a.trim()) && (
            <View style={styles.section}>
              <View style={styles.headingRow}>
                <Icon src={icons.achievement} />
                <Text style={styles.mainTitle}>ACHIEVEMENTS</Text>
              </View>
              {achievements.map((a, i) => a.trim() && (
                <Text key={i} style={styles.bullet} wrap={false}>• {a}</Text>
              ))}
            </View>
          )}

          {objective?.trim() && (
            <View style={styles.section}>
              <View style={styles.headingRow}>
                <Icon src={icons.objective} />
                <Text style={styles.mainTitle}>CAREER OBJECTIVE</Text>
              </View>
              <Text style={styles.text}>{objective}</Text>
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
);


const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
    backgroundColor: '#fff',
    paddingBottom: 20,
    minHeight: '100%',
  },
  container: {
    flexDirection: 'row',
  },
 sidebar: {
  width: '35%',
  backgroundColor: '#e5e5e5', // Light matte gray
  color: '#111',              // Dark text for contrast
  padding: 15,
  alignItems: 'center',
  minHeight: '100%',
},


  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 9,
    marginBottom: 3,
    textAlign: 'center',
    fontWeight: 'bold',
    color : '#111736'
  },
 sidebarSection: {
  width: '100%',
  marginTop: 12,
  paddingVertical: 6,
  borderTop: '1pt solid #444', // softer than pure white
  borderBottom: '1pt solid #444',
},

sidebarHeading: {
  fontSize: 10,
  fontWeight: 'bold',
  marginBottom: 6,
  textTransform: 'uppercase',
  color: '#261414', // subtle light gray instead of pure black
},

boldWhite: {
  color: '#57502d',
  fontWeight: 'bold',
  fontSize: 9,
},

  strengthContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  strength: {
    backgroundColor: 'white',
    color: '#9e3f33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    marginRight: 4,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  main: {
    width: '65%',
    padding: 20,
    backgroundColor: '#fff',
    color: '#111',
    minHeight: '100%',
  },
  section: {
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9e3f33',
    borderBottom: '1pt solid #9e3f33',
    marginBottom: 6,
    paddingBottom: 2,
    textTransform: 'uppercase',
  },
  item: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 10,
    color: '#d6336c',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 9,
    color: '#4444aa',
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 4,
    marginLeft: 10,
  },
  bullet: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 2,
  },
  text: {
    fontSize: 9,
    marginBottom: 3,
  },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1pt solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    borderTop: '1pt solid #000',
  },
  tableColHeader: {
    flex: 1,
    fontWeight: 'bold',
    padding: 4,
    fontSize: 9,
    color: '#000',
  },
  tableCol: {
    flex: 1,
    padding: 4,
    fontSize: 9,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});
