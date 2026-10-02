import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import ViewProfile from "./pages/ViewProfile";
import Experience from "./pages/Experience";
import Internships from "./pages/Internships";
import MockInterviews from "./pages/MockInterviews";
import ProjectDetails from "./pages/ProjectDetails";
import Learning from "./pages/Learning";
import InterviewResult from "./pages/InterviewResult";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";

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

        <Route path="/mock-interview" element={<MockInterviews />} />

        <Route path="/projects/:id" element={<ProjectDetails />} />

        <Route path="/learning" element={<Learning />} />

        <Route path="/interview-result" element={<InterviewResult />} />

        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
