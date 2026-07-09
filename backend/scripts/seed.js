const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Company = require("../models/Company");
const Skill = require("../models/Skill");
const PlacementDrive = require("../models/PlacementDrive");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const MentorNote = require("../models/MentorNote");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

const credentials = {
  admin: { name: "Aarav Placement Admin", email: process.env.SEED_ADMIN_EMAIL || "admin@placementos.demo", password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345" },
  mentor: { name: "Meera Placement Mentor", email: process.env.SEED_MENTOR_EMAIL || "mentor@placementos.demo", password: process.env.SEED_MENTOR_PASSWORD || "Mentor@12345" },
  recruiter: { name: "Rohan Company Recruiter", email: process.env.SEED_RECRUITER_EMAIL || "recruiter@placementos.demo", password: process.env.SEED_RECRUITER_PASSWORD || "Recruiter@12345" },
  student: { name: "Isha Campus Student", email: process.env.SEED_STUDENT_EMAIL || "student@placementos.demo", password: process.env.SEED_STUDENT_PASSWORD || "Student@12345" },
};

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const upsertByFilter = async (Model, filter, payload) =>
  Model.findOneAndUpdate(filter, { $set: payload }, { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true });

const upsertUser = async ({ role, name, email, password, profile = {}, recruiterCompany = null, assignedMentor = null }) => {
  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    user = new User({ name, email, password, role, isActive: true, approvalStatus: "approved", profile, recruiterCompany, assignedMentor });
  } else {
    user.name = name;
    user.role = role;
    user.isActive = true;
    user.approvalStatus = "approved";
    user.profile = { ...(user.profile?.toObject ? user.profile.toObject() : user.profile), ...profile };
    user.recruiterCompany = recruiterCompany ?? user.recruiterCompany;
    user.assignedMentor = assignedMentor ?? user.assignedMentor;
    user.password = password;
  }

  await user.save();
  return user;
};

const seedCompanies = async () => {
  const companies = [
    {
      name: "Tata Consultancy Services",
      website: "https://www.tcs.com",
      description: "Global IT services, consulting, and business solutions partner for campus hiring programs.",
      industry: "Information Technology",
      location: "Mumbai, India",
      logo: "https://www.tcs.com/etc.clientlibs/tcs/clientlibs/clientlib-site/resources/images/logo.png",
      isActive: true,
    },
    {
      name: "Infosys",
      website: "https://www.infosys.com",
      description: "Digital services and consulting company hiring graduates across engineering streams.",
      industry: "Information Technology",
      location: "Bengaluru, India",
      logo: "https://www.infosys.com/content/dam/infosys-web/en/global-resource/media-resources/infosys-logo-jpeg.jpg",
      isActive: true,
    },
    {
      name: "Amazon Development Centre",
      website: "https://www.amazon.jobs",
      description: "Product engineering and operations teams hiring software development and cloud talent.",
      industry: "E-commerce and Cloud",
      location: "Hyderabad, India",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      isActive: true,
    },
  ];

  const records = {};
  for (const company of companies) records[company.name] = await upsertByFilter(Company, { name: company.name }, company);
  return records;
};

const seedSkills = async () => {
  const skills = [
    { name: "Java", category: "programming", level: "advanced", isActive: true },
    { name: "React", category: "frontend", level: "intermediate", isActive: true },
    { name: "Node.js", category: "backend", level: "intermediate", isActive: true },
    { name: "MongoDB", category: "database", level: "intermediate", isActive: true },
    { name: "AWS Cloud", category: "cloud", level: "beginner", isActive: true },
    { name: "Data Structures", category: "programming", level: "advanced", isActive: true },
    { name: "Communication", category: "soft-skill", level: "advanced", isActive: true },
  ];

  const records = {};
  for (const skill of skills) records[skill.name] = await upsertByFilter(Skill, { name: skill.name, category: skill.category, level: skill.level }, skill);
  return records;
};

const seedDrive = async ({ admin, company }) =>
  upsertByFilter(PlacementDrive, { name: "TCS Ninja 2026" }, {
    name: "TCS Ninja 2026",
    company: company._id,
    eligibility: { branches: ["CSE", "IT", "ECE"], minCgpa: 7, batch: [2026], notes: "No active backlogs. Open to final year engineering students from eligible branches." },
    registrationDeadline: addDays(21),
    interviewRounds: [
      { name: "Online aptitude assessment", order: 1, mode: "online" },
      { name: "Technical interview", order: 2, mode: "hybrid" },
      { name: "HR discussion", order: 3, mode: "online" },
    ],
    status: "registration-open",
    createdBy: admin._id,
  });

const seedJobs = async ({ admin, companies, skills, drive }) => {
  const jobs = [
    {
      title: "TCS Ninja Graduate Trainee",
      company: companies["Tata Consultancy Services"]._id,
      placementDrive: drive._id,
      location: "Pune, India",
      workMode: "hybrid",
      jobType: "full-time",
      salary: { min: 350000, max: 420000, currency: "INR", period: "yearly", isDisclosed: true },
      requiredSkills: [skills.Java._id, skills["Data Structures"]._id, skills.Communication._id],
      eligibility: { minCgpa: 7, allowedBranches: ["CSE", "IT", "ECE"], graduationYear: [2026], backlogAllowed: false, notes: "Students must satisfy the TCS Ninja drive eligibility criteria." },
      deadline: addDays(20),
      status: "open",
      description: "Entry-level graduate trainee role for engineering students with strong programming fundamentals, problem-solving ability, and communication skills.",
      createdBy: admin._id,
    },
    {
      title: "Infosys Specialist Programmer Intern",
      company: companies.Infosys._id,
      placementDrive: null,
      location: "Bengaluru, India",
      workMode: "onsite",
      jobType: "internship",
      salary: { min: 25000, max: 35000, currency: "INR", period: "monthly", isDisclosed: true },
      requiredSkills: [skills.React._id, skills["Node.js"]._id, skills.MongoDB._id],
      eligibility: { minCgpa: 7.5, allowedBranches: ["CSE", "IT"], graduationYear: [2026, 2027], backlogAllowed: false, notes: "Full-stack internship with conversion opportunity based on performance." },
      deadline: addDays(28),
      status: "open",
      description: "Specialist programmer internship for students with strong full-stack engineering skills and practical project experience.",
      createdBy: admin._id,
    },
    {
      title: "Amazon SDE Hiring",
      company: companies["Amazon Development Centre"]._id,
      placementDrive: null,
      location: "Hyderabad, India",
      workMode: "hybrid",
      jobType: "full-time",
      salary: { min: 1200000, max: 1800000, currency: "INR", period: "yearly", isDisclosed: true },
      requiredSkills: [skills.Java._id, skills["Data Structures"]._id, skills["AWS Cloud"]._id],
      eligibility: { minCgpa: 8, allowedBranches: ["CSE", "IT"], graduationYear: [2026], backlogAllowed: false, notes: "Strong DSA, system design basics, and cloud fundamentals preferred." },
      deadline: addDays(35),
      status: "draft",
      description: "Software development engineer hiring pipeline for students with excellent coding, design, and ownership skills.",
      createdBy: admin._id,
    },
  ];

  const records = {};
  for (const job of jobs) records[job.title] = await upsertByFilter(Job, { title: job.title, company: job.company }, job);
  return records;
};

const seedApplication = async ({ admin, mentor, student, job }) => {
  const timeline = [
    { status: "applied", note: "Application submitted through the campus portal.", changedBy: student._id, changedAt: addDays(-7) },
    { status: "under-review", note: "Placement cell moved the application to review.", changedBy: admin._id, changedAt: addDays(-6) },
    { status: "mentor-assigned", note: "Mentor assigned for resume and readiness guidance.", changedBy: admin._id, changedAt: addDays(-5) },
    { status: "mentoring-scheduled", note: "Resume review and mock guidance session scheduled.", changedBy: mentor._id, changedAt: addDays(-4) },
    { status: "mentoring-completed", note: "Mentoring session completed with action items.", changedBy: mentor._id, changedAt: addDays(-3) },
    { status: "mentor-recommended", note: "Mentor recommended the candidate for recruiter review.", changedBy: mentor._id, changedAt: addDays(-2) },
    { status: "shortlisted", note: "Placement admin shortlisted the candidate for the drive.", changedBy: admin._id, changedAt: addDays(-1) },
    { status: "recruiter-review", note: "Candidate shared with company recruiter for review.", changedBy: admin._id, changedAt: new Date() },
  ];

  return upsertByFilter(Application, { student: student._id, job: job._id }, { student: student._id, job: job._id, status: "recruiter-review", timeline, remarks: "Interested in software engineering roles with strong campus placement support.", appliedAt: addDays(-7) });
};

const seedInterview = async ({ application }) =>
  upsertByFilter(Interview, { application: application._id, type: "technical" }, { application: application._id, date: addDays(5), type: "technical", score: null, feedback: "", result: "pending" });

const seedMentorNote = async ({ mentor, student, application }) => {
  const noteText = "Resume reviewed. Candidate is ready for recruiter review after strengthening project impact bullets.";
  const note = await upsertByFilter(MentorNote, { mentor: mentor._id, student: student._id, application: application._id, note: noteText }, { mentor: mentor._id, student: student._id, application: application._id, note: noteText, rating: 4, visibility: "admin-visible" });
  await Application.updateOne({ _id: application._id }, { $addToSet: { mentorNotes: note._id } });
  return note;
};

const seedNotifications = async ({ admin, mentor, student, recruiter, job, application, interview }) => {
  const notifications = [
    { user: student._id, type: "job-published", title: "New job published", message: `${job.title} is open for applications.`, entityType: "Job", entityId: job._id, createdBy: admin._id },
    { user: student._id, type: "mentor-assigned", title: "Mentor assigned", message: `${mentor.name} has been assigned as your placement mentor.`, entityType: "User", entityId: mentor._id, createdBy: admin._id },
    { user: student._id, type: "session-scheduled", title: "Mentoring session scheduled", message: "Your resume review and guidance session has been scheduled.", entityType: "Application", entityId: application._id, createdBy: mentor._id },
    { user: student._id, type: "interview-scheduled", title: "Technical interview scheduled", message: "A company technical interview has been scheduled for your shortlisted application.", entityType: "Interview", entityId: interview._id, createdBy: admin._id },
    { user: recruiter._id, type: "application-updated", title: "Candidate ready for recruiter review", message: `${student.name} is shortlisted for ${job.title}.`, entityType: "Application", entityId: application._id, createdBy: admin._id },
  ];

  for (const notification of notifications) {
    await upsertByFilter(Notification, { user: notification.user, type: notification.type, entityType: notification.entityType, entityId: notification.entityId, title: notification.title }, notification);
  }
};

const seedAuditLogs = async ({ admin, mentor, student, job, application, interview }) => {
  const logs = [
    { actor: admin._id, action: "job_created", entityType: "Job", entityId: job._id, metadata: { seed: true } },
    { actor: student._id, action: "student_applied", entityType: "Application", entityId: application._id, metadata: { job: job._id, seed: true } },
    { actor: admin._id, action: "mentor_assigned", entityType: "User", entityId: student._id, metadata: { mentor: mentor._id, seed: true } },
    { actor: mentor._id, action: "mentoring_session_scheduled", entityType: "Application", entityId: application._id, metadata: { seed: true } },
    { actor: admin._id, action: "interview_scheduled", entityType: "Interview", entityId: interview._id, metadata: { application: application._id, seed: true } },
  ];

  for (const log of logs) await upsertByFilter(AuditLog, { action: log.action, entityType: log.entityType, entityId: log.entityId }, log);
};

const printCounts = async () => {
  const counts = {
    users: await User.countDocuments(),
    companies: await Company.countDocuments(),
    skills: await Skill.countDocuments(),
    placementDrives: await PlacementDrive.countDocuments(),
    jobs: await Job.countDocuments(),
    applications: await Application.countDocuments(),
    interviews: await Interview.countDocuments(),
    notifications: await Notification.countDocuments(),
    mentorNotes: await MentorNote.countDocuments(),
    auditLogs: await AuditLog.countDocuments(),
  };

  console.log("Collection counts");
  for (const [name, count] of Object.entries(counts)) console.log(`${name}: ${count}`);
};

const printCredentials = () => {
  console.log("");
  console.log("Seeded demo credentials");
  console.log("");
  console.log("Admin");
  console.log(`Email: ${credentials.admin.email}`);
  console.log(`Password: ${credentials.admin.password}`);
  console.log("");
  console.log("Mentor");
  console.log(`Email: ${credentials.mentor.email}`);
  console.log(`Password: ${credentials.mentor.password}`);
  console.log("");
  console.log("Recruiter");
  console.log(`Email: ${credentials.recruiter.email}`);
  console.log(`Password: ${credentials.recruiter.password}`);
  console.log("");
  console.log("Student");
  console.log(`Email: ${credentials.student.email}`);
  console.log(`Password: ${credentials.student.password}`);
  console.log("");
};

const seed = async () => {
  await connectDB();

  const companies = await seedCompanies();
  const skills = await seedSkills();
  const admin = await upsertUser({ role: "admin", ...credentials.admin });
  const mentor = await upsertUser({ role: "mentor", ...credentials.mentor });
  const recruiter = await upsertUser({ role: "recruiter", ...credentials.recruiter, recruiterCompany: companies["Tata Consultancy Services"]._id });
  const student = await upsertUser({
    role: "student",
    ...credentials.student,
    assignedMentor: mentor._id,
    profile: {
      phone: "+91 98765 43210",
      headline: "Final year CSE student focused on full-stack engineering",
      location: "Bengaluru, India",
      college: "ACS College of Engineering",
      branch: "CSE",
      graduationYear: 2026,
      cgpa: 8.4,
      portfolio: "https://portfolio.example.com/isha",
      linkedin: "https://www.linkedin.com/in/isha-campus-demo",
      github: "https://github.com/isha-campus-demo",
      readinessGoal: "Secure a software engineering role through campus placements.",
      resume: { fileName: "isha-campus-resume.pdf", mimeType: "application/pdf", size: 245760, uploadedAt: addDays(-10) },
      notifications: { email: true, interviews: true, applications: true },
    },
  });

  const drive = await seedDrive({ admin, company: companies["Tata Consultancy Services"] });
  const jobs = await seedJobs({ admin, companies, skills, drive });
  const application = await seedApplication({ admin, mentor, student, job: jobs["TCS Ninja Graduate Trainee"] });
  const interview = await seedInterview({ application });
  await seedMentorNote({ mentor, student, application });
  await seedNotifications({ admin, mentor, student, recruiter, job: jobs["TCS Ninja Graduate Trainee"], application, interview });
  await seedAuditLogs({ admin, mentor, student, job: jobs["TCS Ninja Graduate Trainee"], application, interview });

  await printCounts();
  printCredentials();
};

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });

