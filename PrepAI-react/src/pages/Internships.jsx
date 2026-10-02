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

  const [activeTab, setActiveTab] = useState("recommended");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, recommendedRes, allRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/internships/recommended"),
          api.get("/internships"),
        ]);

        setUser(profileRes.data);
        setRecommendedInternships(recommendedRes.data);
        setAllInternships(allRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

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

        <div className="internship-tabs tabs">
          <button
            className={`internship-tab ${activeTab === "recommended" ? "active" : ""}`}
            onClick={() => setActiveTab("recommended")}
          >
            Recommended
          </button>

          <button
            className={`internship-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Explore All
          </button>
        </div>

        <div className="intern-grid">
          {filteredInternships.map((internship) => (
            <InternshipCard key={internship._id} internship={internship} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Internships;
