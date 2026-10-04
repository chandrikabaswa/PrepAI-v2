import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./MockInterviews.css";
import api from "../services/api";

export function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Audio & Microphone References
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const currentAnswerRef = useRef("");

  // Setup Form State
  const [role, setRole] = useState(location.state?.role || "");
  const [description, setDescription] = useState(
    location.state?.description || ""
  );
  const [difficulty, setDifficulty] = useState(
    location.state?.difficulty || "medium"
  );
  const [questionType, setQuestionType] = useState(
    location.state?.questionType ||
      (location.state?.description ? "jobDescription" : "general")
  );
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  // Stop recording and completely release all microphone tracks
  const stopListening = () => {
    // 1. Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // ignore
        }
      }
      recognitionRef.current = null;
    }

    // 2. Stop MediaRecorder if active
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        // ignore
      }
      mediaRecorderRef.current = null;
    }

    // 3. Stop all audio MediaStream tracks to release hardware microphone
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        // ignore
      }
      mediaStreamRef.current = null;
    }

    setIsListening(false);
  };

  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please type your answer.");
      return;
    }

    // Ensure any existing recording is stopped and cleaned first
    stopListening();

    try {
      // Capture direct MediaStream to ensure microphone hardware lifecycle control
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
        } catch (streamErr) {
          console.warn("Could not capture direct MediaStream (SpeechRecognition will still attempt):", streamErr);
        }
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = "en-IN";
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        if (transcript.trim()) {
          setAnswer(transcript);
          currentAnswerRef.current = transcript;
        }
      };

      recognitionInstance.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          stopListening();
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognitionInstance;
      setIsListening(true);
      recognitionInstance.start();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      stopListening();
    }
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

  // Clean up recording and speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak current question when question changes
  useEffect(() => {
    if (
      interviewStarted &&
      questions.length > 0 &&
      questions[currentQuestion]
    ) {
      speakQuestion(
        `Question ${currentQuestion + 1}. ${
          questions[currentQuestion].question
        }`
      );
    }
  }, [currentQuestion, questions, interviewStarted]);

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    }
  }

  async function handleGenerateInterview() {
    // Client-side validation
    if (!role || !role.trim()) {
      alert("Please enter a Target Job Role.");
      return;
    }

    if (questionType === "resume" && !resumeFile) {
      alert("Please upload your resume for a Resume-Based interview.");
      return;
    }

    if (questionType === "jobDescription" && (!description || !description.trim())) {
      alert("Please provide a Job Description for a Job-Description-Based interview.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("role", role.trim());
      formData.append("difficulty", difficulty);
      formData.append("questionType", questionType);
      formData.append("description", description ? description.trim() : "");

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await api.post("/ai-interview/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setQuestions(response.data);
      setCurrentQuestion(0);
      setAnswers([]);
      setAnswer("");
      currentAnswerRef.current = "";
      setInterviewStartTime(Date.now());
      setInterviewStarted(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to generate interview.");
    } finally {
      setLoading(false);
    }
  }

  const handleNext = () => {
    // Immediately stop microphone and speech recognition
    stopListening();

    // Cancel any active TTS speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const recordedAnswer = currentAnswerRef.current || answer;

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = {
      question: questions[currentQuestion]?.question,
      answer: recordedAnswer,
    };

    setAnswers(updatedAnswers);
    setAnswer("");
    currentAnswerRef.current = "";

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Final question - trigger evaluation
      evaluateInterview(updatedAnswers);
    }
  };

  const evaluateInterview = async (interviewAnswers) => {
    // Extra safety guarantee: stop any microphone or TTS immediately
    stopListening();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (evaluating) return;

    try {
      setEvaluating(true);

      const response = await api.post("/ai-interview/evaluate", {
        role,
        answers: interviewAnswers,
      });

      const durationInSeconds = Math.floor(
        (Date.now() - interviewStartTime) / 1000
      );

      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      const duration = `${minutes} min ${seconds} sec`;

      const data = {
        ...response.data,
        role,
        difficulty,
        questionType,
        totalQuestions: interviewAnswers.length,
        completedQuestions: interviewAnswers.filter(
          (a) => a.answer && a.answer.trim() !== ""
        ).length,
        duration,
        interviewDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        generatedBy: "PrepAI AI",
      };

      navigate("/interview-result", {
        state: data,
      });
    } catch (error) {
      console.error("Evaluation Error:", error);
      if (error.response) {
        alert(error.response.data?.message || "Evaluation failed.");
      } else {
        alert(error.message || "Evaluation failed.");
      }
    } finally {
      setEvaluating(false);
      // Ensure microphone remains OFF after evaluation completes
      stopListening();
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
            Practice real technical interview questions with AI voice recognition,
            custom difficulty, and comprehensive performance evaluation.
          </p>
        </div>

        {/* MAIN CARD */}
        {evaluating ? (
          <div className="mock-card loading-card">
            <div className="loading-icon">🤖</div>
            <h2>AI is evaluating your interview...</h2>
            <p>Analyzing technical depth, communication, and confidence.</p>
            <div className="loader"></div>
          </div>
        ) : !interviewStarted ? (
          <div className="mock-card">
            <h3>Interview Setup</h3>
            <p className="desc">
              Configure your interview preferences and targeting.
            </p>

            {/* Target Job Role */}
            <label>
              Target Job Role <span className="required-star">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer Intern"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            {/* Interview Difficulty */}
            <label>Interview Difficulty</label>
            <div className="segmented-selector">
              {[
                { id: "easy", label: "🟢 Easy", desc: "Fundamental & concepts" },
                { id: "medium", label: "🟡 Medium", desc: "Practical & applied" },
                { id: "hard", label: "🔴 Hard", desc: "Deep & scenario-based" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`segmented-btn ${
                    difficulty.toLowerCase() === d.id ? "active" : ""
                  }`}
                  onClick={() => setDifficulty(d.id)}
                  title={d.desc}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Question Type */}
            <label>Question Type</label>
            <div className="segmented-selector">
              {[
                { id: "general", label: "🌐 General" },
                { id: "resume", label: "📄 Resume Based" },
                { id: "jobDescription", label: "📋 Job Description Based" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`segmented-btn ${
                    questionType === t.id ? "active" : ""
                  }`}
                  onClick={() => setQuestionType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Resume Upload (Highlighted if Resume Based is selected) */}
            <label>
              Upload Resume (PDF, DOCX){" "}
              {questionType === "resume" ? (
                <span className="required-star">*</span>
              ) : (
                <span className="optional-tag">(Optional)</span>
              )}
            </label>

            <label htmlFor="resume" className={`upload ${questionType === "resume" ? "highlight-upload" : ""}`}>
              {fileName ? (
                <p>
                  Resume Uploaded ✔
                  <br />
                  <strong>{fileName}</strong>
                </p>
              ) : (
                <>
                  <div className="upload-icon">☁️</div>
                  <p>Click to upload or drag and drop</p>
                  <span>PDF, DOCX up to 5MB</span>
                </>
              )}
            </label>

            <input
              type="file"
              id="resume"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              onChange={handleFileChange}
            />

            {/* Job Description (Highlighted if Job Description Based is selected) */}
            <label>
              Job Description{" "}
              {questionType === "jobDescription" ? (
                <span className="required-star">*</span>
              ) : (
                <span className="optional-tag">(Optional)</span>
              )}
            </label>

            <textarea
              placeholder={
                questionType === "jobDescription"
                  ? "Paste the target job description and requirements here..."
                  : "Optional: Paste job description to provide extra context..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              className="generate-btn"
              onClick={handleGenerateInterview}
              disabled={loading}
            >
              {loading ? "Generating Interview..." : "Start Interview →"}
            </button>
          </div>
        ) : (
          <div className="mock-card">
            <div className="interview-top-meta">
              <span className="question-count">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="interview-meta-pills">
                <span className="meta-pill difficulty-pill">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <span className="meta-pill type-pill">
                  {questionType === "resume"
                    ? "Resume Based"
                    : questionType === "jobDescription"
                    ? "Job Description"
                    : "General"}
                </span>
              </div>
            </div>

            <h2 className="question">
              {questions[currentQuestion]?.question}
            </h2>

            <textarea
              className="answer-box"
              placeholder="Type or speak your answer..."
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                currentAnswerRef.current = e.target.value;
              }}
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
                    }`
                  )
                }
              >
                🔊 Read Again
              </button>
            </div>

            <button className="generate-btn" onClick={handleNext}>
              {currentQuestion === questions.length - 1
                ? "Finish Interview & Evaluate →"
                : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MockInterview;
