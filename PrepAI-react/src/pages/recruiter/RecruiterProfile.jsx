import { useState, useEffect } from "react";
import api from "../../services/api";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import RecruiterTopbar from "../../components/recruiter/RecruiterTopbar";
import "./RecruiterProfile.css";

export default function RecruiterProfile() {
  const [user, setUser] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyBio, setCompanyBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        const data = res.data;
        setUser(data);
        setCompanyName(data.companyName || "");
        setCompanyWebsite(data.companyWebsite || "");
        setDesignation(data.designation || "");
        setCompanyLocation(data.companyLocation || "");
        setIndustry(data.industry || "");
        setCompanyBio(data.companyBio || "");
      } catch (err) {
        console.error("Failed to load recruiter profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await api.put("/users/profile", {
        companyName,
        companyWebsite,
        designation,
        companyLocation,
        industry,
        companyBio,
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage({ text: "Company profile updated successfully! 🎉", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <RecruiterSidebar />
        <div className="recruiter-main">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <RecruiterSidebar />

      <div className="recruiter-main">
        <RecruiterTopbar user={user} />

        <div className="page-header">
          <h1>Company & Recruiter Profile</h1>
          <p>Manage your company details and recruiter identity for applicants.</p>
        </div>

        {message.text && (
          <div className={`alert-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="profile-form-grid">
          {/* Left card: Account / Identity Info */}
          <div className="card profile-overview-card">
            <div className="company-avatar-large">
              {companyName ? companyName[0].toUpperCase() : user.name ? user.name[0].toUpperCase() : "C"}
            </div>
            <h3>{companyName || "Your Company"}</h3>
            <p className="recruiter-title-tag">
              {designation ? `${designation} at ${companyName || "Company"}` : user.name}
            </p>
            <div className="badge-tag">{industry || "Tech & Software"}</div>

            <div className="meta-info-list">
              <div>
                <strong>Recruiter:</strong> {user.name}
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              {companyWebsite && (
                <div>
                  <strong>Website:</strong>{" "}
                  <a href={companyWebsite} target="_blank" rel="noreferrer">
                    {companyWebsite.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right card: Form Inputs */}
          <div className="card profile-edit-card">
            <h3>Company Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Designation / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Talent Acquisition Specialist"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company Website</label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Office Location / Headquarters</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, India or Remote"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence, SaaS, FinTech, E-Commerce"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>About Company / Bio</label>
              <textarea
                rows="5"
                placeholder="Tell candidates about your company mission, tech stack, and engineering culture..."
                value={companyBio}
                onChange={(e) => setCompanyBio(e.target.value)}
              />
            </div>

            <button type="submit" className="save-profile-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Company Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
