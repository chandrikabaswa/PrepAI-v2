import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./MockInterviews.css";
import api from "../services/api";

export function MockInterview() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluating, setEvaluating] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [role, setRole] = useState(location.state?.role || "");
  const [description, setDescription] = useState(location.state?.description || "");

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    }
  }

  async function handleGenerateInterview() {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("role", role);
      formData.append("description", description);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await api.post("/ai-interview/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setQuestions(response.data);
      setInterviewStartTime(Date.now());
      setInterviewStarted(true);
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to generate interview.");
    } finally {
      setLoading(false);
    }
  }

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported.");
      return;
    }

    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.lang = "en-IN";
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;

    recognitionRef.current = recognitionInstance;

    setIsListening(true);

    recognitionInstance.start();

    recognitionInstance.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      setAnswer(transcript);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
  };

  const speakQuestion = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (
      interviewStarted &&
      questions.length > 0 &&
      questions[currentQuestion]
    ) {
      speakQuestion(
        `Question ${currentQuestion + 1}. ${
          questions[currentQuestion].question
        }`,
      );
    }
  }, [currentQuestion, questions, interviewStarted]);

  const handleNext = () => {
    const updatedAnswers = [...answers];

    updatedAnswers[currentQuestion] = {
      question: questions[currentQuestion].question,
      answer,
    };

    setAnswers(updatedAnswers);
    setAnswer("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      evaluateInterview(updatedAnswers);
    }
  };

  const evaluateInterview = async (interviewAnswers) => {
    try {
      setEvaluating(true);

      const response = await api.post("/ai-interview/evaluate", {
        role,
        answers: interviewAnswers,
      });

      const durationInSeconds = Math.floor(
        (Date.now() - interviewStartTime) / 1000,
      );

      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;

      const duration = `${minutes} min ${seconds} sec`;

      const data = {
        ...response.data,
        role,
        totalQuestions: interviewAnswers.length,
        completedQuestions: interviewAnswers.filter(
          (a) => a.answer && a.answer.trim() !== "",
        ).length,
        duration,
        interviewDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        generatedBy: "Gemini AI",
      };

      navigate("/interview-result", {
        state: data,
      });
    } catch (error) {
      console.error("Evaluation Error:", error);

      if (error.response) {
        console.log(error.response.data);
        alert(error.response.data.message);
      } else {
        alert(error.message);
      }
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="mock-main">
        {/* TOPBAR */}

        <div className="mock-topbar">
          <div></div>

          <div className="profile-section">
            <div className="profile-info">
              <div>{user.name}</div>
              <div className="profile-branch">{user.branch}</div>
            </div>

            <div className="avatar">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
          </div>
        </div>

        {/* HEADER */}

        <div className="mock-header">
          <div className="bot">🤖</div>

          <h1>AI Mock Interview</h1>

          <p>
            Our AI will analyze your resume and the job description to generate
            personalized interview questions.
          </p>
        </div>

        {/* CARD */}

        {/* CARD */}

        {evaluating ? (
          <div className="mock-card loading-card">
            <div className="loading-icon">🤖</div>

            <h2>AI is evaluating your interview...</h2>

            <p>Please wait a few seconds.</p>

            <div className="loader"></div>
          </div>
        ) : !interviewStarted ? (
          <div className="mock-card">
            <h3>Interview Setup</h3>

            <p className="desc">
              Provide details about the role you are targeting.
            </p>

            <label>Upload Resume (PDF)</label>

            <label htmlFor="resume" className="upload">
              {fileName ? (
                <p>
                  Resume Uploaded ✔
                  <br />
                  {fileName}
                </p>
              ) : (
                <>
                  <div className="upload-icon">☁️</div>

                  <p>Click to upload or drag and drop</p>

                  <span>PDF, DOCX up to 5MB</span>
                </>
              )}
            </label>

            <input type="file" id="resume" hidden onChange={handleFileChange} />

            <label>Target Job Role</label>

            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <label>Job Description</label>

            <textarea
              placeholder="Paste the job description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              className="generate-btn"
              onClick={handleGenerateInterview}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Interview"}
            </button>
          </div>
        ) : (
          <div className="mock-card">
            <p className="question-count">
              Question {currentQuestion + 1} of {questions.length}
            </p>

            <h2 className="question">{questions[currentQuestion]?.question}</h2>

            <textarea
              className="answer-box"
              placeholder="Type or speak your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
            />

            <div className="voice-controls">
              <button
                className={`voice-btn ${isListening ? "stop" : "start"}`}
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? "🛑 Stop Listening" : "🎤 Start Listening"}
              </button>

              <button
                className="voice-btn read-btn"
                onClick={() =>
                  speakQuestion(
                    `Question ${currentQuestion + 1}. ${
                      questions[currentQuestion]?.question
                    }`,
                  )
                }
              >
                🔊 Read Again
              </button>
            </div>

            <button className="generate-btn" onClick={handleNext}>
              {currentQuestion === questions.length - 1
                ? "Finish Interview"
                : "Next Question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MockInterview;
