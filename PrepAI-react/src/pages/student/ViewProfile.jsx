import "./ViewProfile.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/student/Sidebar";
import Topbar from "../../components/student/Topbar";

function formatUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getResumeUrl(fileUrl) {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  return `http://localhost:5000${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

function normalizeSkill(skill) {
  return (skill || "").trim();
}

function deduplicateSkills(skills) {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();
  const result = [];
  for (const s of skills) {
    const trimmed = (typeof s === "string" ? s : String(s)).trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }
  return result;
}

const EXPERIENCE_TYPES = [
  "Internship",
  "Full-time",
  "Part-time",
  "Freelance",
  "Research",
  "Volunteer",
  "Other",
];

function ViewProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initialUser = JSON.parse(localStorage.getItem("user")) || {
    name: "",
    email: "",
    college: "",
    degree: "",
    branch: "",
    year: "",
    goal: "",
    bio: "",
    skills: [],
    projects: [],
    experience: [],
    achievements: [],
    certifications: [],
    codingProfiles: {},
    recruiterVisibility: true,
    resume: {},
  };

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  // Internal tab state: "profile" | "projects" | "achievements" | "certifications" | "experience"
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam &&
        ["profile", "projects", "achievements", "certifications", "experience"].includes(
          tabParam.toLowerCase()
        )
      ) {
        return tabParam.toLowerCase();
      }
    } catch (e) {
      // ignore
    }
    return "profile";
  });

  // Skills state
  const [newSkill, setNewSkill] = useState("");
  const [skillError, setSkillError] = useState("");

  // Modals state
  const [isEditBasicOpen, setIsEditBasicOpen] = useState(false);
  const [basicFormData, setBasicFormData] = useState({
    name: "",
    college: "",
    degree: "",
    branch: "",
    year: "",
    goal: "",
    bio: "",
  });

  const [isEditLinksOpen, setIsEditLinksOpen] = useState(false);
  const [linksFormData, setLinksFormData] = useState({
    github: "",
    leetcode: "",
    hackerrank: "",
    linkedin: "",
  });

  // Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectIndexToEdit, setProjectIndexToEdit] = useState(null);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: "",
  });

  // Achievement Modal
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [achievementIndexToEdit, setAchievementIndexToEdit] = useState(null);
  const [achievementFormData, setAchievementFormData] = useState({
    title: "",
    description: "",
    date: "",
    link: "",
  });

  // Certification Modal
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
  const [certificationIndexToEdit, setCertificationIndexToEdit] = useState(null);
  const [certificationFormData, setCertificationFormData] = useState({
    name: "",
    organization: "",
    date: "",
    credentialUrl: "",
  });

  // Experience Modal
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [experienceIndexToEdit, setExperienceIndexToEdit] = useState(null);
  const [experienceFormData, setExperienceFormData] = useState({
    type: "Internship",
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
    achievements: "",
    skills: "",
    link: "",
  });

  // Resume Auto Skill Extraction Review Modal
  const [isResumeExtractModalOpen, setIsResumeExtractModalOpen] = useState(false);
  const [detectedSkillsList, setDetectedSkillsList] = useState([]);
  const [selectedDetectedSkills, setSelectedDetectedSkills] = useState([]);
  const [isExtractingResume, setIsExtractingResume] = useState(false);

  // Load fresh profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const showNotification = (text, type = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg({ text: "", type: "" });
    }, 4000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/profile");
      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveUserUpdate = async (updatedData, successMessage = "Profile updated successfully") => {
    try {
      const res = await api.put("/users/profile", updatedData);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showNotification(successMessage, "success");
      return res.data.user;
    } catch (err) {
      console.error("Update profile error:", err);
      showNotification(err.response?.data?.message || "Failed to update profile", "error");
      throw err;
    }
  };

  // ==========================================
  // BASIC PROFILE EDIT
  // ==========================================
  const handleOpenEditBasic = () => {
    setBasicFormData({
      name: user.name || "",
      college: user.college || "",
      degree: user.degree || "",
      branch: user.branch || "",
      year: user.year || "",
      goal: user.goal || "",
      bio: user.bio || "",
    });
    setIsEditBasicOpen(true);
  };

  const handleSaveBasic = async (e) => {
    e.preventDefault();
    try {
      await saveUserUpdate(basicFormData, "Basic details saved successfully!");
      setIsEditBasicOpen(false);
    } catch (err) {
      // notification handled in saveUserUpdate
    }
  };

  // ==========================================
  // SKILLS MANAGEMENT
  // ==========================================
  const handleAddSkill = async (e) => {
    if (e) e.preventDefault();
    setSkillError("");
    const trimmed = normalizeSkill(newSkill);
    if (!trimmed) return;

    const existing = user.skills || [];
    const isDuplicate = existing.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setSkillError(`"${trimmed}" is already in your skills list.`);
      return;
    }

    const updatedSkills = deduplicateSkills([...existing, trimmed]);
    try {
      await saveUserUpdate({ skills: updatedSkills }, `Added "${trimmed}" to skills`);
      setNewSkill("");
    } catch (err) {
      // handled
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = (user.skills || []).filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    try {
      await saveUserUpdate({ skills: updatedSkills }, `Removed "${skillToRemove}"`);
    } catch (err) {
      // handled
    }
  };

  // ==========================================
  // RESUME UPLOAD & AUTO-EXTRACTION
  // ==========================================
  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      fileExt === ".docx";
    const isPdf = file.type === "application/pdf" || fileExt === ".pdf";

    if (!isPdf && !isDocx) {
      showNotification("Supported formats: PDF, DOCX only.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size exceeds the 5 MB limit.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsExtractingResume(true);
      showNotification("Uploading resume and analyzing skills with AI...", "info");

      // 1. Upload & save resume to profile
      const resumeFormData = new FormData();
      resumeFormData.append("resume", file);
      const uploadRes = await api.put("/users/profile", resumeFormData);
      setUser(uploadRes.data.user);
      localStorage.setItem("user", JSON.stringify(uploadRes.data.user));

      // 2. Extract skills using AI
      const extractForm = new FormData();
      extractForm.append("resume", file);
      const extractRes = await api.post("/users/extract-skills", extractForm);

      const detected = extractRes.data?.skills || [];
      if (detected.length > 0) {
        const existingLower = new Set(
          (uploadRes.data.user.skills || []).map((s) => s.toLowerCase())
        );

        const newDetected = detected.filter(
          (s) => !existingLower.has(s.toLowerCase())
        );

        if (newDetected.length > 0) {
          setDetectedSkillsList(detected);
          setSelectedDetectedSkills(newDetected);
          setIsResumeExtractModalOpen(true);
        } else {
          showNotification("Resume uploaded! All detected skills are already on your profile.", "success");
        }
      } else {
        showNotification("Resume uploaded successfully! No new skills detected.", "success");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      showNotification("Resume uploaded, but automatic skill extraction could not run.", "warning");
    } finally {
      setIsExtractingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleDetectedSkill = (skill) => {
    if (selectedDetectedSkills.includes(skill)) {
      setSelectedDetectedSkills(selectedDetectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedDetectedSkills([...selectedDetectedSkills, skill]);
    }
  };

  const handleApplyDetectedSkills = async () => {
    const existing = user.skills || [];
    const merged = deduplicateSkills([...existing, ...selectedDetectedSkills]);
    try {
      await saveUserUpdate(
        { skills: merged },
        `Added ${selectedDetectedSkills.length} new skill(s) from resume!`
      );
      setIsResumeExtractModalOpen(false);
    } catch (err) {
      // handled
    }
  };

  // ==========================================
  // CODING PROFILES
  // ==========================================
  const handleOpenEditLinks = () => {
    const profiles = user.codingProfiles || {};
    setLinksFormData({
      github: profiles.github || "",
      leetcode: profiles.leetcode || "",
      hackerrank: profiles.hackerrank || "",
      linkedin: profiles.linkedin || "",
    });
    setIsEditLinksOpen(true);
  };

  const handleSaveLinks = async (e) => {
    e.preventDefault();
    try {
      await saveUserUpdate(
        { codingProfiles: linksFormData },
        "Profile links updated successfully!"
      );
      setIsEditLinksOpen(false);
    } catch (err) {
      // handled
    }
  };

  // ==========================================
  // PROJECTS MANAGEMENT (OWN PROJECTS)
  // ==========================================
  const handleOpenAddProject = () => {
    setProjectIndexToEdit(null);
    setProjectFormData({
      title: "",
      description: "",
      techStack: "",
      githubUrl: "",
      liveUrl: "",
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (index) => {
    const proj = user.projects?.[index];
    if (!proj) return;
    setProjectIndexToEdit(index);
    setProjectFormData({
      title: proj.title || "",
      description: proj.description || "",
      techStack: Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack || "",
      githubUrl: proj.githubUrl || "",
      liveUrl: proj.liveUrl || "",
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectFormData.title.trim()) {
      showNotification("Project title is required", "error");
      return;
    }

    const techStackArray = deduplicateSkills(
      projectFormData.techStack.split(",").map((s) => s.trim()).filter(Boolean)
    );

    const projectObj = {
      title: projectFormData.title.trim(),
      description: projectFormData.description.trim(),
      techStack: techStackArray,
      githubUrl: projectFormData.githubUrl.trim(),
      liveUrl: projectFormData.liveUrl.trim(),
    };

    const updatedProjects = [...(user.projects || [])];
    if (projectIndexToEdit !== null && projectIndexToEdit >= 0) {
      updatedProjects[projectIndexToEdit] = {
        ...updatedProjects[projectIndexToEdit],
        ...projectObj,
      };
    } else {
      updatedProjects.push(projectObj);
    }

    try {
      await saveUserUpdate({ projects: updatedProjects }, "Project saved successfully!");
      setIsProjectModalOpen(false);
    } catch (err) {
      // handled
    }
  };

  const handleDeleteProject = async (index) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const updatedProjects = (user.projects || []).filter((_, i) => i !== index);
    try {
      await saveUserUpdate({ projects: updatedProjects }, "Project deleted");
    } catch (err) {
      // handled
    }
  };

  // ==========================================
  // ACHIEVEMENTS MANAGEMENT
  // ==========================================
  const handleOpenAddAchievement = () => {
    setAchievementIndexToEdit(null);
    setAchievementFormData({ title: "", description: "", date: "", link: "" });
    setIsAchievementModalOpen(true);
  };

  const handleOpenEditAchievement = (index) => {
    const item = user.achievements?.[index];
    if (!item) return;
    setAchievementIndexToEdit(index);
    if (typeof item === "string") {
      setAchievementFormData({ title: item, description: "", date: "", link: "" });
    } else {
      setAchievementFormData({
        title: item.title || "",
        description: item.description || "",
        date: item.date || "",
        link: item.link || "",
      });
    }
    setIsAchievementModalOpen(true);
  };

  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    if (!achievementFormData.title.trim()) {
      showNotification("Achievement title is required", "error");
      return;
    }

    const itemObj = {
      title: achievementFormData.title.trim(),
      description: achievementFormData.description.trim(),
      date: achievementFormData.date.trim(),
      link: achievementFormData.link.trim(),
    };

    const updated = [...(user.achievements || [])];
    if (achievementIndexToEdit !== null && achievementIndexToEdit >= 0) {
      updated[achievementIndexToEdit] = {
        ...(typeof updated[achievementIndexToEdit] === "object" ? updated[achievementIndexToEdit] : {}),
        ...itemObj,
      };
    } else {
      updated.push(itemObj);
    }

    try {
      await saveUserUpdate({ achievements: updated }, "Achievement saved!");
      setIsAchievementModalOpen(false);
    } catch (err) {
      // handled
    }
  };

  const handleDeleteAchievement = async (index) => {
    if (!window.confirm("Delete this achievement?")) return;
    const updated = (user.achievements || []).filter((_, i) => i !== index);
    try {
      await saveUserUpdate({ achievements: updated }, "Achievement deleted");
    } catch (err) {
      // handled
    }
  };

  // ==========================================
  // CERTIFICATIONS MANAGEMENT
  // ==========================================
  const handleOpenAddCertification = () => {
    setCertificationIndexToEdit(null);
    setCertificationFormData({ name: "", organization: "", date: "", credentialUrl: "" });
    setIsCertificationModalOpen(true);
  };

  const handleOpenEditCertification = (index) => {
    const item = user.certifications?.[index];
    if (!item) return;
    setCertificationIndexToEdit(index);
    if (typeof item === "string") {
      setCertificationFormData({ name: item, organization: "", date: "", credentialUrl: "" });
    } else {
      setCertificationFormData({
        name: item.name || "",
        organization: item.organization || "",
        date: item.date || "",
        credentialUrl: item.credentialUrl || "",
      });
    }
    setIsCertificationModalOpen(true);
  };

  const handleSaveCertification = async (e) => {
    e.preventDefault();
    if (!certificationFormData.name.trim()) {
      showNotification("Certification name is required", "error");
      return;
    }

    const itemObj = {
      name: certificationFormData.name.trim(),
      organization: certificationFormData.organization.trim(),
      date: certificationFormData.date.trim(),
      credentialUrl: certificationFormData.credentialUrl.trim(),
    };

    const updated = [...(user.certifications || [])];
    if (certificationIndexToEdit !== null && certificationIndexToEdit >= 0) {
      updated[certificationIndexToEdit] = {
        ...(typeof updated[certificationIndexToEdit] === "object" ? updated[certificationIndexToEdit] : {}),
        ...itemObj,
      };
    } else {
      updated.push(itemObj);
    }

    try {
      await saveUserUpdate({ certifications: updated }, "Certification saved!");
      setIsCertificationModalOpen(false);
    } catch (err) {
      // handled
    }
  };

  const handleDeleteCertification = async (index) => {
    if (!window.confirm("Delete this certification?")) return;
    const updated = (user.certifications || []).filter((_, i) => i !== index);
    try {
      await saveUserUpdate({ certifications: updated }, "Certification deleted");
    } catch (err) {
      // handled
    }
  };

  // ==========================================
  // EXPERIENCE MANAGEMENT
  // ==========================================
  const handleOpenAddExperience = () => {
    setExperienceIndexToEdit(null);
    setExperienceFormData({
      type: "Internship",
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
      achievements: "",
      skills: "",
      link: "",
    });
    setIsExperienceModalOpen(true);
  };

  const handleOpenEditExperience = (index) => {
    const item = user.experience?.[index];
    if (!item) return;
    setExperienceIndexToEdit(index);
    setExperienceFormData({
      type: item.type || "Internship",
      company: item.company || "",
      role: item.role || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      currentlyWorking: Boolean(item.currentlyWorking),
      description: item.description || "",
      achievements: item.achievements || "",
      skills: Array.isArray(item.skills) ? item.skills.join(", ") : item.skills || "",
      link: item.link || "",
    });
    setIsExperienceModalOpen(true);
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!experienceFormData.company.trim() || !experienceFormData.role.trim()) {
      showNotification("Company name and role are required.", "error");
      return;
    }

    const skillsArray = deduplicateSkills(
      experienceFormData.skills.split(",").map((s) => s.trim()).filter(Boolean)
    );

    const experienceEntry = {
      type: experienceFormData.type || "Internship",
      company: experienceFormData.company.trim(),
      role: experienceFormData.role.trim(),
      location: experienceFormData.location.trim(),
      startDate: experienceFormData.startDate.trim(),
      endDate: experienceFormData.currentlyWorking ? "" : experienceFormData.endDate.trim(),
      currentlyWorking: experienceFormData.currentlyWorking,
      description: experienceFormData.description.trim(),
      achievements: experienceFormData.achievements.trim(),
      skills: skillsArray,
      link: experienceFormData.link.trim(),
    };

    const updatedExperience = [...(user.experience || [])];
    if (experienceIndexToEdit !== null && experienceIndexToEdit >= 0) {
      updatedExperience[experienceIndexToEdit] = {
        ...updatedExperience[experienceIndexToEdit],
        ...experienceEntry,
      };
    } else {
      updatedExperience.push(experienceEntry);
    }

    try {
      await saveUserUpdate(
        { experience: updatedExperience },
        experienceIndexToEdit !== null ? "Experience updated successfully!" : "Experience added successfully!"
      );
      setIsExperienceModalOpen(false);
    } catch (err) {
      // handled
    }
  };

  const handleDeleteExperience = async (index) => {
    if (!window.confirm("Are you sure you want to delete this experience entry?")) return;
    const updatedExperience = (user.experience || []).filter((_, i) => i !== index);
    try {
      await saveUserUpdate({ experience: updatedExperience }, "Experience deleted");
    } catch (err) {
      // handled
    }
  };

  // ==========================================
  // RECRUITER VISIBILITY TOGGLE
  // ==========================================
  const handleToggleRecruiterVisibility = async (e) => {
    const isVisible = e.target.checked;
    try {
      await saveUserUpdate(
        { recruiterVisibility: isVisible },
        isVisible ? "Profile is now visible to recruiters" : "Profile is now hidden from recruiters"
      );
    } catch (err) {
      // handled
    }
  };

  const skills = user.skills || [];
  const projects = user.projects || [];
  const experiences = user.experience || [];
  const achievements = user.achievements || [];
  const certifications = user.certifications || [];
  const profiles = user.codingProfiles || {};
  const hasProfiles = Boolean(
    profiles.github || profiles.leetcode || profiles.hackerrank || profiles.linkedin
  );

  return (
    <div className="layout">
      <Sidebar />

      <div className="main profile-view-main">
        <Topbar user={user} />

        {feedbackMsg.text && (
          <div className={`profile-toast-banner ${feedbackMsg.type}`}>
            {feedbackMsg.text}
          </div>
        )}

        {/* ========================================================
            PROFILE HEADER (TOP CARD) - Kept above tabs
        ======================================================== */}
        <div className="profile-section-card profile-hero-card">
          <div className="hero-content">
            <div className="avatar-huge">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>

            <div className="hero-details">
              <div className="hero-top-line">
                <h1 className="hero-name">{user.name || "Student Name"}</h1>
                {user.recruiterVisibility ? (
                  <span className="recruiter-badge active" title="Visible to recruiters">
                    🟢 Recruiter Visible
                  </span>
                ) : (
                  <span className="recruiter-badge private" title="Hidden from recruiters">
                    ⚪ Private Profile
                  </span>
                )}
              </div>

              <p className="hero-academic">
                {user.degree && `${user.degree} • `}
                {user.branch || "Branch"} {user.year && `(${user.year})`}
              </p>

              {user.college && <p className="hero-college">🏛️ {user.college}</p>}

              {user.goal && (
                <div className="hero-goal-badge">
                  <span className="goal-label">🎯 Career Goal:</span>
                  <span className="goal-val">{user.goal}</span>
                </div>
              )}

              {user.bio && <p className="hero-bio">{user.bio}</p>}
            </div>
          </div>

          <div className="hero-actions">
            <button className="secondary-btn" onClick={handleOpenEditBasic}>
              ✏️ Edit Profile Info
            </button>
          </div>
        </div>

        {/* ========================================================
            HORIZONTAL TABS (INSIDE PROFILE PAGE)
        ======================================================== */}
        <div className="profile-tabs-bar" role="tablist" aria-label="Profile Sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            className={`profile-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "projects"}
            className={`profile-tab-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            Projects
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "achievements"}
            className={`profile-tab-btn ${activeTab === "achievements" ? "active" : ""}`}
            onClick={() => setActiveTab("achievements")}
          >
            Achievements
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "certifications"}
            className={`profile-tab-btn ${activeTab === "certifications" ? "active" : ""}`}
            onClick={() => setActiveTab("certifications")}
          >
            Certifications
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "experience"}
            className={`profile-tab-btn ${activeTab === "experience" ? "active" : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            Experience
          </button>
        </div>

        {/* ========================================================
            TAB 1 — PROFILE (Academic, Skills, Resume, Profiles, Recruiter)
        ======================================================== */}
        {activeTab === "profile" && (
          <div className="profile-dashboard-grid">
            {/* LEFT COLUMN: Academic Information & Skills */}
            <div className="profile-col">
              {/* 1. Academic Information */}
              <div className="profile-section-card">
                <div className="card-head-row">
                  <h3>🎓 Academic Information</h3>
                </div>

                <div className="academic-details-list">
                  <div className="academic-row">
                    <span className="academic-label">College / University:</span>
                    <span className="academic-val">{user.college || "Not Set"}</span>
                  </div>

                  <div className="academic-row">
                    <span className="academic-label">Degree:</span>
                    <span className="academic-val">{user.degree || "Not Set"}</span>
                  </div>

                  <div className="academic-row">
                    <span className="academic-label">Branch:</span>
                    <span className="academic-val">{user.branch || "Not Set"}</span>
                  </div>

                  <div className="academic-row">
                    <span className="academic-label">Year of Study:</span>
                    <span className="academic-val">{user.year || "Not Set"}</span>
                  </div>
                </div>
              </div>

              {/* 2. Skills & Technologies */}
              <div className="profile-section-card">
                <div className="card-head-row">
                  <div>
                    <h3>⚡ Skills & Technologies</h3>
                    <p className="section-subtext">
                      Add tools, languages, and frameworks you know.
                    </p>
                  </div>
                  {skills.length > 0 && (
                    <span className="count-pill">{skills.length} skills</span>
                  )}
                </div>

                <div className="skills-interactive-wrap">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <span key={skill} className="interactive-skill-pill">
                        {skill}
                        <button
                          type="button"
                          className="skill-remove-x"
                          onClick={() => handleRemoveSkill(skill)}
                          title={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="empty-state-text">No skills added yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddSkill} className="add-skill-form-inline">
                  <input
                    type="text"
                    placeholder="e.g. React, Python, Docker..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  <button type="submit" className="add-skill-btn">
                    + Add Skill
                  </button>
                </form>

                {skillError && <p className="field-error-inline">{skillError}</p>}
              </div>
            </div>

            {/* RIGHT COLUMN: Resume, Profiles, Recruiter Visibility */}
            <div className="profile-col">
              {/* 3. Resume */}
              <div className="profile-section-card">
                <div className="card-head-row">
                  <div>
                    <h3>📄 Resume</h3>
                    <p className="section-subtext">
                      Used for AI Resume Analysis and Recruiter matching.
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  id="profile-resume-upload"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeFileChange}
                  style={{ display: "none" }}
                />

                {user.resume?.fileName ? (
                  <div className="resume-status-box uploaded">
                    <div className="resume-icon-block">📄</div>
                    <div className="resume-meta">
                      <span className="resume-filename">{user.resume.fileName}</span>
                      <span className="resume-uploaded-status">
                        ✓ Uploaded {user.resume.uploadedAt ? new Date(user.resume.uploadedAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="resume-box-actions">
                      {user.resume.fileUrl && (
                        <a
                          href={getResumeUrl(user.resume.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link-action"
                        >
                          View Resume
                        </a>
                      )}
                      <label
                        htmlFor="profile-resume-upload"
                        className="btn-replace-resume"
                      >
                        {isExtractingResume ? "Uploading..." : "Replace Resume"}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="resume-status-box empty">
                    <div className="resume-icon-block empty-icon">📁</div>
                    <div className="resume-meta">
                      <span className="resume-empty-title">No resume uploaded yet.</span>
                      <span className="resume-specs-hint">Supported formats: PDF, DOCX (Max 5 MB)</span>
                    </div>
                    <label
                      htmlFor="profile-resume-upload"
                      className="btn-upload-resume"
                    >
                      {isExtractingResume ? "Uploading..." : "+ Upload Resume"}
                    </label>
                  </div>
                )}
              </div>

              {/* 4. Coding & Professional Profiles */}
              <div className="profile-section-card">
                <div className="card-head-row">
                  <div>
                    <h3>🌐 Coding & Professional Profiles</h3>
                    <p className="section-subtext">
                      Link your public technical profiles.
                    </p>
                  </div>
                  <button
                    className="btn-link-secondary"
                    onClick={handleOpenEditLinks}
                  >
                    ✏️ Edit Links
                  </button>
                </div>

                {hasProfiles ? (
                  <div className="profiles-badges-grid">
                    {profiles.github && (
                      <a
                        href={formatUrl(profiles.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-site-pill github"
                      >
                        <span>🐙 GitHub</span>
                        <span className="arrow-ext">↗</span>
                      </a>
                    )}

                    {profiles.leetcode && (
                      <a
                        href={formatUrl(profiles.leetcode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-site-pill leetcode"
                      >
                        <span>💻 LeetCode</span>
                        <span className="arrow-ext">↗</span>
                      </a>
                    )}

                    {profiles.hackerrank && (
                      <a
                        href={formatUrl(profiles.hackerrank)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-site-pill hackerrank"
                      >
                        <span>🟩 HackerRank</span>
                        <span className="arrow-ext">↗</span>
                      </a>
                    )}

                    {profiles.linkedin && (
                      <a
                        href={formatUrl(profiles.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-site-pill linkedin"
                      >
                        <span>👔 LinkedIn</span>
                        <span className="arrow-ext">↗</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="empty-state-text">
                    No profile links added yet. Click &quot;Edit Links&quot; to connect your GitHub, LeetCode, or LinkedIn.
                  </p>
                )}
              </div>

              {/* 5. Recruiter Visibility */}
              <div className="profile-section-card recruiter-settings-card">
                <h3>💼 Recruiter Visibility</h3>
                <div className="recruiter-toggle-row">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={Boolean(user.recruiterVisibility)}
                      onChange={handleToggleRecruiterVisibility}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">
                      Make my profile visible to recruiters
                    </span>
                  </label>
                </div>
                <p className="recruiter-desc">
                  Allow verified recruiters to discover your candidate profile, review your completed projects, and evaluate your experience.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2 — PROJECTS (Student's Completed / Own Projects)
        ======================================================== */}
        {activeTab === "projects" && (
          <div className="profile-tab-content">
            <div className="tab-pane-header">
              <div>
                <h2 className="tab-pane-title">Projects</h2>
                <p className="tab-pane-desc">
                  Showcase what you have built (your completed personal and course projects).
                </p>
              </div>
              <button className="primary-tab-action-btn" onClick={handleOpenAddProject}>
                + Add Project
              </button>
            </div>

            {projects.length > 0 ? (
              <div className="tab-cards-grid projects-tab-grid">
                {projects.map((proj, idx) => (
                  <div key={proj._id || idx} className="tab-entity-card project-entity-card">
                    <div className="entity-card-header">
                      <h3 className="entity-card-title">{proj.title}</h3>
                      <div className="entity-actions">
                        <button
                          type="button"
                          className="btn-icon-action"
                          onClick={() => handleOpenEditProject(idx)}
                          title="Edit project"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-icon-action delete"
                          onClick={() => handleDeleteProject(idx)}
                          title="Delete project"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {proj.description && (
                      <p className="entity-card-desc">{proj.description}</p>
                    )}

                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="entity-stack-wrap">
                        {Array.isArray(proj.techStack)
                          ? proj.techStack.map((tech) => (
                              <span key={tech} className="tech-pill">
                                {tech}
                              </span>
                            ))
                          : <span className="tech-pill">{proj.techStack}</span>}
                      </div>
                    )}

                    {(proj.githubUrl || proj.liveUrl) && (
                      <div className="entity-links-row">
                        {proj.githubUrl && (
                          <a
                            href={formatUrl(proj.githubUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link-btn"
                          >
                            GitHub ↗
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={formatUrl(proj.liveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link-btn live"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="tab-empty-state">
                <div className="tab-empty-icon">🚀</div>
                <h3>No projects added yet</h3>
                <p>
                  Showcase the projects you have completed, personal repositories, and capstone work.
                </p>
                <button className="primary-tab-action-btn" onClick={handleOpenAddProject}>
                  + Add Project
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3 — ACHIEVEMENTS
        ======================================================== */}
        {activeTab === "achievements" && (
          <div className="profile-tab-content">
            <div className="tab-pane-header">
              <div>
                <h2 className="tab-pane-title">Achievements</h2>
                <p className="tab-pane-desc">
                  Hackathons, awards, recognitions, and competitive milestones.
                </p>
              </div>
              <button className="primary-tab-action-btn" onClick={handleOpenAddAchievement}>
                + Add Achievement
              </button>
            </div>

            {achievements.length > 0 ? (
              <div className="tab-cards-grid achievements-tab-grid">
                {achievements.map((ach, idx) => {
                  const title = typeof ach === "string" ? ach : ach.title;
                  const desc = typeof ach === "string" ? "" : ach.description;
                  const date = typeof ach === "string" ? "" : ach.date;
                  const link = typeof ach === "string" ? "" : ach.link;

                  return (
                    <div key={ach._id || idx} className="tab-entity-card achievement-entity-card">
                      <div className="entity-card-header">
                        <h3 className="entity-card-title">⭐ {title}</h3>
                        <div className="entity-actions">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => handleOpenEditAchievement(idx)}
                            title="Edit achievement"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action delete"
                            onClick={() => handleDeleteAchievement(idx)}
                            title="Delete achievement"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {date && <span className="entity-meta-date">📅 {date}</span>}
                      {desc && <p className="entity-card-desc">{desc}</p>}
                      {link && (
                        <div className="entity-links-row">
                          <a
                            href={formatUrl(link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="entity-proof-link"
                          >
                            View Evidence / Link ↗
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tab-empty-state">
                <div className="tab-empty-icon">🏆</div>
                <h3>No achievements added yet</h3>
                <p>Highlight your competition wins, honors, scholarships, and milestones.</p>
                <button className="primary-tab-action-btn" onClick={handleOpenAddAchievement}>
                  + Add Achievement
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4 — CERTIFICATIONS
        ======================================================== */}
        {activeTab === "certifications" && (
          <div className="profile-tab-content">
            <div className="tab-pane-header">
              <div>
                <h2 className="tab-pane-title">Certifications</h2>
                <p className="tab-pane-desc">
                  Verified licenses, courses, and certifications you have earned.
                </p>
              </div>
              <button className="primary-tab-action-btn" onClick={handleOpenAddCertification}>
                + Add Certification
              </button>
            </div>

            {certifications.length > 0 ? (
              <div className="tab-cards-grid certifications-tab-grid">
                {certifications.map((cert, idx) => {
                  const name = typeof cert === "string" ? cert : cert.name;
                  const org = typeof cert === "string" ? "" : cert.organization;
                  const date = typeof cert === "string" ? "" : cert.date;
                  const credUrl = typeof cert === "string" ? "" : cert.credentialUrl;

                  return (
                    <div key={cert._id || idx} className="tab-entity-card certification-entity-card">
                      <div className="entity-card-header">
                        <h3 className="entity-card-title">🎖️ {name}</h3>
                        <div className="entity-actions">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => handleOpenEditCertification(idx)}
                            title="Edit certification"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action delete"
                            onClick={() => handleDeleteCertification(idx)}
                            title="Delete certification"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {org && <p className="entity-org">Issued by: <strong>{org}</strong></p>}
                      {date && <span className="entity-meta-date">📅 {date}</span>}
                      {credUrl && (
                        <div className="entity-links-row">
                          <a
                            href={formatUrl(credUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="entity-proof-link"
                          >
                            Verify Credential ↗
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tab-empty-state">
                <div className="tab-empty-icon">📜</div>
                <h3>No certifications added yet</h3>
                <p>Add industry certifications, course completions, and accreditations.</p>
                <button className="primary-tab-action-btn" onClick={handleOpenAddCertification}>
                  + Add Certification
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5 — EXPERIENCE
        ======================================================== */}
        {activeTab === "experience" && (
          <div className="profile-tab-content">
            <div className="tab-pane-header">
              <div>
                <h2 className="tab-pane-title">Experience</h2>
                <p className="tab-pane-desc">
                  Internships, full-time positions, research, and freelance work history.
                </p>
              </div>
              <button className="primary-tab-action-btn" onClick={handleOpenAddExperience}>
                + Add Experience
              </button>
            </div>

            {experiences.length > 0 ? (
              <div className="tab-cards-grid experience-tab-grid">
                {experiences.map((exp, idx) => (
                  <div key={exp._id || idx} className="tab-entity-card experience-entity-card">
                    <div className="entity-card-header">
                      <div>
                        <div className="exp-role-line">
                          <h3 className="entity-card-title">{exp.role}</h3>
                          <span className={`exp-type-badge ${exp.type?.toLowerCase().replace(/\s+/g, "-") || "internship"}`}>
                            {exp.type || "Internship"}
                          </span>
                        </div>
                        <h4 className="exp-company">{exp.company}</h4>
                      </div>

                      <div className="entity-actions">
                        <button
                          type="button"
                          className="btn-icon-action"
                          onClick={() => handleOpenEditExperience(idx)}
                          title="Edit Experience"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-icon-action delete"
                          onClick={() => handleDeleteExperience(idx)}
                          title="Delete Experience"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="exp-meta-row">
                      <span className="exp-meta-item">
                        📅 {exp.startDate || "N/A"} – {exp.currentlyWorking ? "Present" : exp.endDate || "N/A"}
                      </span>
                      {exp.location && (
                        <span className="exp-meta-item">
                          📍 {exp.location}
                        </span>
                      )}
                    </div>

                    {exp.description && (
                      <div className="exp-section-block">
                        <span className="block-label">Description:</span>
                        <p className="block-text">{exp.description}</p>
                      </div>
                    )}

                    {exp.achievements && (
                      <div className="exp-section-block">
                        <span className="block-label">Achievements / Impact:</span>
                        <p className="block-text">{exp.achievements}</p>
                      </div>
                    )}

                    {exp.skills && exp.skills.length > 0 && (
                      <div className="exp-section-block">
                        <span className="block-label">Skills Used:</span>
                        <div className="exp-skills-wrap">
                          {Array.isArray(exp.skills)
                            ? exp.skills.map((skill) => (
                                <span key={skill} className="exp-skill-chip">
                                  {skill}
                                </span>
                              ))
                            : <span className="exp-skill-chip">{exp.skills}</span>}
                        </div>
                      </div>
                    )}

                    {exp.link && (
                      <div className="exp-link-row">
                        <a
                          href={formatUrl(exp.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="exp-evidence-link"
                        >
                          View Organization / Project Link ↗
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="tab-empty-state">
                <div className="tab-empty-icon">💼</div>
                <h3>No experience added yet</h3>
                <p>Add your internships, research experience, freelance roles, or full-time jobs.</p>
                <button className="primary-tab-action-btn" onClick={handleOpenAddExperience}>
                  + Add Experience
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: EDIT BASIC PROFILE DETAILS
      ======================================================== */}
      {isEditBasicOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Profile Information</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditBasicOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBasic} className="modal-form">
              <label>Full Name</label>
              <input
                type="text"
                value={basicFormData.name}
                onChange={(e) => setBasicFormData({ ...basicFormData, name: e.target.value })}
                required
              />

              <label>College / University</label>
              <input
                type="text"
                value={basicFormData.college}
                onChange={(e) => setBasicFormData({ ...basicFormData, college: e.target.value })}
              />

              <label>Degree</label>
              <input
                type="text"
                placeholder="e.g. Bachelor of Technology"
                value={basicFormData.degree}
                onChange={(e) => setBasicFormData({ ...basicFormData, degree: e.target.value })}
              />

              <div className="row-2col">
                <div className="col-field">
                  <label>Branch</label>
                  <select
                    value={basicFormData.branch}
                    onChange={(e) => setBasicFormData({ ...basicFormData, branch: e.target.value })}
                  >
                    <option value="">Select Branch</option>
                    <option>Computer Science</option>
                    <option>Information Technology</option>
                    <option>Artificial Intelligence</option>
                    <option>Data Science</option>
                    <option>Electronics</option>
                  </select>
                </div>

                <div className="col-field">
                  <label>Year</label>
                  <select
                    value={basicFormData.year}
                    onChange={(e) => setBasicFormData({ ...basicFormData, year: e.target.value })}
                  >
                    <option value="">Select Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Graduate</option>
                  </select>
                </div>
              </div>

              <label>Career Goal</label>
              <input
                type="text"
                placeholder="e.g. Full Stack Developer, AI Engineer"
                value={basicFormData.goal}
                onChange={(e) => setBasicFormData({ ...basicFormData, goal: e.target.value })}
              />

              <label>Bio / About Me</label>
              <textarea
                rows="3"
                placeholder="Brief summary of your background and career interests..."
                value={basicFormData.bio}
                onChange={(e) => setBasicFormData({ ...basicFormData, bio: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditBasicOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT CODING PROFILE LINKS
      ======================================================== */}
      {isEditLinksOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Coding & Professional Profiles</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditLinksOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLinks} className="modal-form">
              <label>GitHub</label>
              <input
                type="text"
                placeholder="https://github.com/yourusername"
                value={linksFormData.github}
                onChange={(e) => setLinksFormData({ ...linksFormData, github: e.target.value })}
              />

              <label>LeetCode</label>
              <input
                type="text"
                placeholder="https://leetcode.com/u/yourusername"
                value={linksFormData.leetcode}
                onChange={(e) => setLinksFormData({ ...linksFormData, leetcode: e.target.value })}
              />

              <label>HackerRank</label>
              <input
                type="text"
                placeholder="https://www.hackerrank.com/yourusername"
                value={linksFormData.hackerrank}
                onChange={(e) => setLinksFormData({ ...linksFormData, hackerrank: e.target.value })}
              />

              <label>LinkedIn</label>
              <input
                type="text"
                placeholder="https://www.linkedin.com/in/yourusername"
                value={linksFormData.linkedin}
                onChange={(e) => setLinksFormData({ ...linksFormData, linkedin: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditLinksOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Links
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ADD / EDIT STUDENT PROJECT
      ======================================================== */}
      {isProjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{projectIndexToEdit !== null ? "Edit Project" : "Add New Project"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsProjectModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="modal-form">
              <label>Project Title *</label>
              <input
                type="text"
                placeholder="e.g. PrepAI Platform"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                required
              />

              <label>Description *</label>
              <textarea
                rows="3"
                placeholder="Describe what the project does, its architecture, and key features..."
                value={projectFormData.description}
                onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                required
              />

              <label>Technologies Used (comma-separated)</label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB, Docker"
                value={projectFormData.techStack}
                onChange={(e) => setProjectFormData({ ...projectFormData, techStack: e.target.value })}
              />

              <label>GitHub Repository URL (Optional)</label>
              <input
                type="text"
                placeholder="https://github.com/yourusername/project"
                value={projectFormData.githubUrl}
                onChange={(e) => setProjectFormData({ ...projectFormData, githubUrl: e.target.value })}
              />

              <label>Live Demo URL (Optional)</label>
              <input
                type="text"
                placeholder="https://myproject.vercel.app"
                value={projectFormData.liveUrl}
                onChange={(e) => setProjectFormData({ ...projectFormData, liveUrl: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {projectIndexToEdit !== null ? "Update Project" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ADD / EDIT ACHIEVEMENT
      ======================================================== */}
      {isAchievementModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{achievementIndexToEdit !== null ? "Edit Achievement" : "Add Achievement"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAchievementModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="modal-form">
              <label>Achievement Title *</label>
              <input
                type="text"
                placeholder="e.g. 1st Place at National Smart City Hackathon"
                value={achievementFormData.title}
                onChange={(e) => setAchievementFormData({ ...achievementFormData, title: e.target.value })}
                required
              />

              <label>Description (Optional)</label>
              <textarea
                rows="2"
                placeholder="Brief context on the award, team, or competition..."
                value={achievementFormData.description}
                onChange={(e) => setAchievementFormData({ ...achievementFormData, description: e.target.value })}
              />

              <label>Date (Optional)</label>
              <input
                type="text"
                placeholder="e.g. March 2026"
                value={achievementFormData.date}
                onChange={(e) => setAchievementFormData({ ...achievementFormData, date: e.target.value })}
              />

              <label>Link / Proof URL (Optional)</label>
              <input
                type="text"
                placeholder="https://..."
                value={achievementFormData.link}
                onChange={(e) => setAchievementFormData({ ...achievementFormData, link: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAchievementModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: ADD / EDIT CERTIFICATION
      ======================================================== */}
      {isCertificationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{certificationIndexToEdit !== null ? "Edit Certification" : "Add Certification"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsCertificationModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCertification} className="modal-form">
              <label>Certification Name *</label>
              <input
                type="text"
                placeholder="e.g. AWS Certified Solutions Architect"
                value={certificationFormData.name}
                onChange={(e) => setCertificationFormData({ ...certificationFormData, name: e.target.value })}
                required
              />

              <label>Issuing Organization</label>
              <input
                type="text"
                placeholder="e.g. Amazon Web Services, Coursera, Meta"
                value={certificationFormData.organization}
                onChange={(e) => setCertificationFormData({ ...certificationFormData, organization: e.target.value })}
              />

              <label>Date / Issue Date</label>
              <input
                type="text"
                placeholder="e.g. June 2026"
                value={certificationFormData.date}
                onChange={(e) => setCertificationFormData({ ...certificationFormData, date: e.target.value })}
              />

              <label>Credential URL (Optional)</label>
              <input
                type="text"
                placeholder="https://www.credly.com/..."
                value={certificationFormData.credentialUrl}
                onChange={(e) => setCertificationFormData({ ...certificationFormData, credentialUrl: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsCertificationModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: ADD / EDIT EXPERIENCE
      ======================================================== */}
      {isExperienceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card modal-experience">
            <div className="modal-header">
              <h3>{experienceIndexToEdit !== null ? "Edit Experience" : "Add Experience"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsExperienceModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="modal-form">
              <div className="row-2col">
                <div className="col-field">
                  <label>Experience Type *</label>
                  <select
                    value={experienceFormData.type}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, type: e.target.value })}
                  >
                    {EXPERIENCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-field">
                  <label>Role / Position *</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineering Intern"
                    value={experienceFormData.role}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row-2col">
                <div className="col-field">
                  <label>Company / Organization *</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Technologies"
                    value={experienceFormData.company}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, company: e.target.value })}
                    required
                  />
                </div>

                <div className="col-field">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, Remote"
                    value={experienceFormData.location}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="row-2col">
                <div className="col-field">
                  <label>Start Date</label>
                  <input
                    type="text"
                    placeholder="e.g. May 2026"
                    value={experienceFormData.startDate}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, startDate: e.target.value })}
                  />
                </div>

                <div className="col-field">
                  <label>End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. July 2026"
                    value={experienceFormData.endDate}
                    disabled={experienceFormData.currentlyWorking}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="checkbox-field-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={experienceFormData.currentlyWorking}
                    onChange={(e) =>
                      setExperienceFormData({
                        ...experienceFormData,
                        currentlyWorking: e.target.checked,
                        endDate: e.target.checked ? "" : experienceFormData.endDate,
                      })
                    }
                  />
                  <span>Currently working here</span>
                </label>
              </div>

              <label>Description</label>
              <textarea
                rows="3"
                placeholder="Developed REST APIs using Node.js and Express, collaborated with frontend team..."
                value={experienceFormData.description}
                onChange={(e) => setExperienceFormData({ ...experienceFormData, description: e.target.value })}
              />

              <label>Achievements / Impact (Optional)</label>
              <textarea
                rows="2"
                placeholder="Optional key achievements or contributions..."
                value={experienceFormData.achievements}
                onChange={(e) => setExperienceFormData({ ...experienceFormData, achievements: e.target.value })}
              />

              <label>Skills Used (comma-separated)</label>
              <input
                type="text"
                placeholder="Node.js, Express, MongoDB, Git"
                value={experienceFormData.skills}
                onChange={(e) => setExperienceFormData({ ...experienceFormData, skills: e.target.value })}
              />

              <label>Optional Experience Link</label>
              <input
                type="text"
                placeholder="https://company.com or recommendation link"
                value={experienceFormData.link}
                onChange={(e) => setExperienceFormData({ ...experienceFormData, link: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsExperienceModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {experienceIndexToEdit !== null ? "Update Experience" : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 7: SKILLS DETECTED FROM RESUME (REVIEW & MERGE)
      ======================================================== */}
      {isResumeExtractModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card modal-detected-skills">
            <div className="modal-header">
              <h3>✨ Skills Detected from Your Resume</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsResumeExtractModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="detected-skills-body">
              <p className="detected-hint">
                Our AI extracted technical skills from your uploaded resume. Select which skills you would like to add to your profile:
              </p>

              <div className="detected-skills-groups">
                {/* 1. Already on profile */}
                {skills.length > 0 && (
                  <div className="skills-group">
                    <span className="group-title">Already on your profile:</span>
                    <div className="group-chips">
                      {skills.map((s) => (
                        <span key={s} className="existing-skill-chip">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Newly detected skills */}
                <div className="skills-group">
                  <span className="group-title">New skills found in resume:</span>
                  <div className="detected-checkboxes-grid">
                    {detectedSkillsList
                      .filter(
                        (s) =>
                          !skills.some(
                            (exist) => exist.toLowerCase() === s.toLowerCase()
                          )
                      )
                      .map((s) => {
                        const isChecked = selectedDetectedSkills.includes(s);
                        return (
                          <label key={s} className={`detected-skill-check ${isChecked ? "checked" : ""}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleDetectedSkill(s)}
                            />
                            <span>+ {s}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsResumeExtractModalOpen(false)}
              >
                Skip / Don&apos;t Add
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleApplyDetectedSkills}
                disabled={selectedDetectedSkills.length === 0}
              >
                Add Selected Skills ({selectedDetectedSkills.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewProfile;
