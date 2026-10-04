import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ProfileSetup.css";

function ProfileSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("1st Year");
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [extractSuccessMsg, setExtractSuccessMsg] = useState("");

  // Coding & Professional Profiles state
  const [github, setGithub] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [hackerrank, setHackerrank] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResumeChange = async (e) => {
    setResumeError("");
    setExtractSuccessMsg("");
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
      setResumeError("Supported formats: PDF, DOCX only.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File size exceeds 5 MB limit.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setResumeFile(file);

    // Auto extract skills from resume
    try {
      setIsExtractingSkills(true);
      const extractForm = new FormData();
      extractForm.append("resume", file);
      const res = await api.post("/users/extract-skills", extractForm);

      if (res.data?.skills && res.data.skills.length > 0) {
        const detected = res.data.skills;
        const existingList = skills
          ? skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const seen = new Set(existingList.map((s) => s.toLowerCase()));
        const toAdd = detected.filter((s) => !seen.has(s.toLowerCase()));
        const merged = [...existingList, ...toAdd];

        setSkills(merged.join(", "));
        setExtractSuccessMsg(
          `✨ Detected ${detected.length} skills from your resume! You can edit them below.`
        );
      }
    } catch (err) {
      console.warn("Could not auto-extract skills:", err);
      setResumeError("Could not automatically detect skills. You can add them manually.");
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeError("");
    setExtractSuccessMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function createProfile(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const skillsArray = skills
        ? skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

      const codingProfiles = {};
      if (github.trim()) codingProfiles.github = github.trim();
      if (leetcode.trim()) codingProfiles.leetcode = leetcode.trim();
      if (hackerrank.trim()) codingProfiles.hackerrank = hackerrank.trim();
      if (linkedin.trim()) codingProfiles.linkedin = linkedin.trim();

      const formData = new FormData();
      formData.append("college", college.trim());
      formData.append("degree", degree.trim());
      formData.append("branch", branch);
      formData.append("year", year);
      formData.append("skills", JSON.stringify(skillsArray));
      formData.append("goal", goal.trim());

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      formData.append("codingProfiles", JSON.stringify(codingProfiles));

      // Axios handles multipart/form-data boundary automatically
      const res = await api.put("/users/profile", formData);

      // Update localStorage with latest user details
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Profile created successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Profile submission error:", error);
      alert(error.response?.data?.message || "Profile update failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>Build Your Profile</h2>

        <form onSubmit={createProfile}>
          <label>College / University</label>
          <input
            type="text"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />

          <label>Degree</label>
          <input
            type="text"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            required
          />

          <div className="row">
            <div className="field">
              <label>Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Artificial Intelligence</option>
                <option>Data Science</option>
              </select>
            </div>

            <div className="field">
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
          </div>

          <label>Skills</label>
          <input
            type="text"
            placeholder="HTML, Python, React"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          <label>Career Goal</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          {/* Resume Upload Section */}
          <div className="resume-section">
            <label>Resume</label>
            <div className="resume-upload-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                id="resume-upload"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleResumeChange}
                style={{ display: "none" }}
              />
              <label htmlFor="resume-upload" className="resume-choose-btn">
                {isExtractingSkills ? "Analyzing Resume..." : "Choose Resume"}
              </label>
              <span className="resume-specs">PDF, DOCX • Max 5 MB</span>
            </div>

            {isExtractingSkills && (
              <p className="resume-analyzing-text">
                <span className="spinner-inline"></span> Extracting skills from resume with AI...
              </p>
            )}

            {extractSuccessMsg && (
              <p className="resume-extract-success">{extractSuccessMsg}</p>
            )}

            {resumeFile && (
              <div className="resume-selected-info">
                <span className="file-icon">📄</span>
                <span className="file-name">Selected: {resumeFile.name}</span>
                <button
                  type="button"
                  className="resume-remove-btn"
                  onClick={handleRemoveResume}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            )}

            {resumeError && <p className="resume-error-text">{resumeError}</p>}
          </div>

          {/* Coding & Professional Profiles Section */}
          <div className="coding-profiles-section">
            <h3>Coding & Professional Profiles</h3>

            <label>GitHub</label>
            <input
              type="text"
              placeholder="https://github.com/yourusername"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />

            <label>LeetCode</label>
            <input
              type="text"
              placeholder="https://leetcode.com/u/yourusername"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
            />

            <label>HackerRank</label>
            <input
              type="text"
              placeholder="https://www.hackerrank.com/yourusername"
              value={hackerrank}
              onChange={(e) => setHackerrank(e.target.value)}
            />

            <label>LinkedIn</label>
            <input
              type="text"
              placeholder="https://www.linkedin.com/in/yourusername"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>

          <button
            className="primary-btn"
            type="submit"
            disabled={isSubmitting || isExtractingSkills}
          >
            {isSubmitting ? "Creating Profile..." : "Create My Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;
