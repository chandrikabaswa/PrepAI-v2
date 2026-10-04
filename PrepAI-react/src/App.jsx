import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/shared/Login";

import Dashboard from "./pages/student/Dashboard";
import Experience from "./pages/student/Experience";
import Internships from "./pages/student/Internships";
import InterviewResult from "./pages/student/InterviewResult";
import Learning from "./pages/student/Learning";
import MockInterviews from "./pages/student/MockInterviews";
import ProfileSetup from "./pages/student/ProfileSetup";
import ProjectDetails from "./pages/student/ProjectDetails";
import Projects from "./pages/student/Projects";
import ResumeAnalyzer from "./pages/student/ResumeAnalyzer";
import ViewProfile from "./pages/student/ViewProfile";

import CandidateMatching from "./pages/recruiter/CandidateMatching";
import ManageInternships from "./pages/recruiter/ManageInternships";
import PostInternship from "./pages/recruiter/PostInternship";
import RecruiterApplicants from "./pages/recruiter/RecruiterApplicants";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/profile-setup" element={<ProfileSetup />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<ViewProfile />} />

        <Route path="/experience" element={<Navigate to="/profile?tab=experience" replace />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/internships" element={<Internships />} />

        <Route
          path="/my-applications"
          element={<Internships defaultTab="applied" />}
        />

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
          path="/recruiter/post-internship"
          element={<PostInternship />}
        />

        <Route
          path="/recruiter/edit-internship/:id"
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

        <Route
          path="/recruiter/candidates/:internshipId"
          element={<CandidateMatching />}
        />

        <Route
          path="/recruiter/internships/:internshipId/applicants"
          element={<RecruiterApplicants />}
        />

        <Route
          path="/recruiter/applicants"
          element={<RecruiterApplicants />}
        />

        <Route
          path="/recruiter/applicants/:internshipId"
          element={<RecruiterApplicants />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
