import { BrowserRouter, Routes, Route } from "react-router-dom";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import ViewProfile from "./pages/ViewProfile";
import Internships from "./pages/Internships";
import MockInterviews from "./pages/MockInterviews";
import ProjectDetails from "./pages/ProjectDetails";
import Learning from "./pages/Learning";
import InterviewResult from "./pages/InterviewResult";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterProfile from "./pages/RecruiterProfile";
import PostInternship from "./pages/PostInternship";
import ManageInternships from "./pages/ManageInternships";
import CandidateMatching from "./pages/CandidateMatching";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/profile-setup" element={<ProfileSetup />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<ViewProfile />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/internships" element={<Internships />} />

        <Route path="/mock-interview" element={<MockInterviews />} />

        <Route path="/projects/:id" element={<ProjectDetails />} />

        <Route path="/learning" element={<Learning />} />

        <Route path="/interview-result" element={<InterviewResult />} />

        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />

        <Route
  path="/recruiter/dashboard"
  element={<RecruiterDashboard />}
/>

<Route
  path="/recruiter/profile"
  element={<RecruiterProfile />}
/>

<Route
  path="/recruiter/internships/new"
  element={<PostInternship />}
/>

<Route
  path="/recruiter/internships"
  element={<ManageInternships />}
/>

<Route
  path="/recruiter/candidates"
  element={<CandidateMatching />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
