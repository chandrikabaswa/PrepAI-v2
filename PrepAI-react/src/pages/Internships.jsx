import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import "./Internships.css";
import InternshipCard from "../components/InternshipCard";

function Internships() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [recommendedInternships, setRecommendedInternships] = useState([]);
  const [allInternships, setAllInternships] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState({});

  const [activeTab, setActiveTab] = useState("recommended");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, recommendedRes, allRes, applicationsRes] =
          await Promise.all([
            api.get("/users/profile"),
            api.get("/internships/recommended"),
            api.get("/internships"),
            api.get("/applications/student").catch(() => ({ data: [] })),
          ]);

        setUser(profileRes.data);
        setRecommendedInternships(recommendedRes.data);
        setAllInternships(allRes.data);

        const appliedMap = {};
        (applicationsRes.data || []).forEach((app) => {
          const intId = app.internship?._id || app.internship;
          if (intId) {
            appliedMap[intId] = app.status || "Applied";
          }
        });
        setAppliedInternships(appliedMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleApplySuccess = (internshipId) => {
    setAppliedInternships((prev) => ({
      ...prev,
      [internshipId]: "Applied",
    }));
  };

  const internships =
    activeTab === "recommended" ? recommendedInternships : allInternships;

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      const keyword = search.toLowerCase();

      return (
        internship.title.toLowerCase().includes(keyword) ||
        internship.company.toLowerCase().includes(keyword) ||
        internship.location.toLowerCase().includes(keyword) ||
        internship.skills.some((skill) => skill.toLowerCase().includes(keyword))
      );
    });
  }, [internships, search]);

  return (
    <div className="layout">
      <Sidebar />

      <div className="intern-main">
        <div className="intern-topbar">
          <input
            type="text"
            placeholder="🔍 Search company, role or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="profile-section" onClick={() => navigate("/profile")}>
            <div className="profile-info">
              <div>{user.name}</div>
              <div className="profile-branch">{user.branch}</div>
            </div>

            <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div className="intern-header">
          <h1>Internship Opportunities</h1>

          <p>Discover internships matched to your skills.</p>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "recommended" ? "active" : ""}
            onClick={() => setActiveTab("recommended")}
          >
            Recommended
          </button>

          <button
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            Explore All
          </button>
        </div>

        <div className="intern-grid">
          {filteredInternships.map((internship) => (
            <InternshipCard
              key={internship._id}
              internship={internship}
              isApplied={Boolean(appliedInternships[internship._id])}
              appliedStatus={appliedInternships[internship._id]}
              onApplied={() => handleApplySuccess(internship._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Internships;
