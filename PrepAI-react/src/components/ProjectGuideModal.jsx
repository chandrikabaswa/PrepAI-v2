import { useState } from "react";
import "./ProjectGuideModal.css";

// Curated verified official technical documentation
export const OFFICIAL_DOCS = {
  react: { name: "React Official Docs", url: "https://react.dev" },
  "node.js": { name: "Node.js Documentation", url: "https://nodejs.org/docs" },
  nodejs: { name: "Node.js Documentation", url: "https://nodejs.org/docs" },
  express: { name: "Express.js Guide", url: "https://expressjs.com" },
  "express.js": { name: "Express.js Guide", url: "https://expressjs.com" },
  mongodb: { name: "MongoDB Manual", url: "https://www.mongodb.com/docs" },
  docker: { name: "Docker Documentation", url: "https://docs.docker.com" },
  python: { name: "Python Documentation", url: "https://docs.python.org/3/" },
  fastapi: { name: "FastAPI Documentation", url: "https://fastapi.tiangolo.com" },
  flask: { name: "Flask Documentation", url: "https://flask.palletsprojects.com" },
  django: { name: "Django Project Documentation", url: "https://docs.djangoproject.com" },
  postgresql: { name: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/" },
  sql: { name: "PostgreSQL / SQL Docs", url: "https://www.postgresql.org/docs/" },
  mysql: { name: "MySQL Documentation", url: "https://dev.mysql.com/doc/" },
  redis: { name: "Redis Documentation", url: "https://redis.io/docs" },
  typescript: { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
  javascript: { name: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  html: { name: "MDN HTML Reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
  css: { name: "MDN CSS Reference", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
  git: { name: "Git Documentation", url: "https://git-scm.com/doc" },
  java: { name: "Oracle Java Docs", url: "https://docs.oracle.com/en/java/" },
  "spring boot": { name: "Spring Boot Reference", url: "https://spring.io/projects/spring-boot" },
  "next.js": { name: "Next.js Documentation", url: "https://nextjs.org/docs" },
  nextjs: { name: "Next.js Documentation", url: "https://nextjs.org/docs" },
  redux: { name: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org" },
  tailwind: { name: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs" },
  tailwindcss: { name: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs" },
  firebase: { name: "Firebase Documentation", url: "https://firebase.google.com/docs" },
  aws: { name: "AWS Documentation", url: "https://docs.aws.amazon.com" },
  flutter: { name: "Flutter Documentation", url: "https://docs.flutter.dev" },
  tensorflow: { name: "TensorFlow Guide", url: "https://www.tensorflow.org/guide" },
  pytorch: { name: "PyTorch Documentation", url: "https://pytorch.org/docs" },
  pandas: { name: "Pandas Documentation", url: "https://pandas.pydata.org/docs" },
  "scikit-learn": { name: "Scikit-Learn Guide", url: "https://scikit-learn.org/stable" },
  opencv: { name: "OpenCV Documentation", url: "https://docs.opencv.org" },
  "socket.io": { name: "Socket.io Documentation", url: "https://socket.io/docs" },
};

/**
 * Intelligent helper to select EXACTLY 4 domain-relevant real-world problem
 * statements based on the project's title, description, skills, and tech stack.
 */
export function getProblemStatements(proj) {
  if (!proj) return [];

  const text = `${proj.title || ""} ${proj.description || ""} ${(proj.skills || []).join(" ")} ${(proj.techStack || []).join(" ")} ${(proj.technologies || []).join(" ")} ${proj.reason || ""} ${proj.whyRecommended || ""}`.toLowerCase();
  const has = (...keywords) => keywords.some((kw) => text.includes(kw));

  // 1. AI / Machine Learning projects
  if (
    has(
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "nlp",
      "llm",
      "neural",
      "deep learning",
      "groq",
      "openai",
      "gpt",
      "model",
      "vision",
      "recommender"
    )
  ) {
    return [
      {
        id: "ai-fraud",
        icon: "🛡️",
        title: "Financial Fraud Detection",
        problem:
          "Online payment platforms face high chargeback and fraud losses. Build an AI-driven service that scores transaction risks and flags suspicious behavior in real-time.",
        whatYouBuild:
          "An intelligent transaction risk evaluation API that analyzes payment anomalies, computes risk scores, and routes suspicious transactions to a review queue.",
        features: [
          "Real-time transaction risk scoring API endpoint",
          "Rule-based and heuristic anomaly detection",
          "Automated alert queue for high-risk flags",
          "Audit trail and explanation logging for compliance",
          "Dashboard endpoints for risk telemetry and false-positive rates",
        ],
        buildSteps: [
          "Phase 1: Project & Data Setup — Initialize the API server and establish data contracts for transaction payloads.",
          "Phase 2: Risk Scoring Pipeline — Build the feature calculation engine analyzing amount, frequency, and location velocity.",
          "Phase 3: Decision Engine — Implement threshold-based risk scoring and flagging rules.",
          "Phase 4: Audit & Explanation — Store anomaly justification logs and build investigation retrieval endpoints.",
          "Phase 5: Testing & Hardening — Validate edge cases with synthetic high-volume transaction test suites.",
        ],
      },
      {
        id: "ai-resume",
        icon: "📄",
        title: "Resume Screening Assistant",
        problem:
          "Recruiting teams spend hours manually parsing resumes. Build an AI service that extracts skills, matches applicant experience against job specs, and ranks candidates.",
        whatYouBuild:
          "An AI-powered candidate evaluation service that parses incoming resumes, maps skills to job descriptions, and calculates ranked match percentages.",
        features: [
          "Multi-format resume text extraction and normalization",
          "Semantic skill extraction and requirement gap analysis",
          "Candidate match scoring and qualification breakdown",
          "Automated executive summary generation for recruiters",
          "Batch candidate ranking and export endpoints",
        ],
        buildSteps: [
          "Phase 1: Parsing Pipeline — Build file ingestion for PDF and DOCX documents with text extraction.",
          "Phase 2: Skill Extraction — Implement entity extraction and skill taxonomy mapping.",
          "Phase 3: Requirement Matching — Compare candidate evidence against structured job descriptions.",
          "Phase 4: Ranking & Reporting — Generate candidate match scores, strength summaries, and skill gap lists.",
          "Phase 5: Evaluation & Docs — Benchmark match accuracy and create API documentation.",
        ],
      },
      {
        id: "ai-recommender",
        icon: "🛍️",
        title: "Personalized Recommendation Engine",
        problem:
          "Digital platforms struggle to personalize discovery. Build a recommendation engine that serves tailored suggestions based on user interaction history.",
        whatYouBuild:
          "A personalized recommendation service computing collaborative item similarities and real-time smart suggestions.",
        features: [
          "User interaction logging (views, likes, and actions)",
          "Content-based and collaborative similarity calculation",
          "Personalized top-N recommendation query endpoint",
          "Cold-start fallback strategy for new visitors",
          "Recommendation performance and conversion tracking",
        ],
        buildSteps: [
          "Phase 1: Architecture Setup — Set up server and datastore for user interaction events.",
          "Phase 2: Interaction Tracking — Build high-throughput event logging endpoints.",
          "Phase 3: Similarity Engine — Compute item-to-item similarity matrices from history.",
          "Phase 4: Recommendation Serving — Implement low-latency recommendation endpoints with caching.",
          "Phase 5: Fallbacks & Testing — Handle cold-start scenarios and verify response times.",
        ],
      },
      {
        id: "ai-support",
        icon: "💬",
        title: "Context-Aware Knowledge Assistant",
        problem:
          "Support teams are overwhelmed by repetitive queries. Build an AI assistant API that answers user questions using product documentation with accurate citations.",
        whatYouBuild:
          "A knowledge-grounded support assistant API that indexes documentation and generates factual, referenced answers to customer inquiries.",
        features: [
          "Documentation chunking and semantic query search",
          "Grounded response generation with source citations",
          "Conversation session state and context persistence",
          "Confidence threshold evaluation with human fallback trigger",
          "Feedback loop logging for answer quality scoring",
        ],
        buildSteps: [
          "Phase 1: Ingestion Pipeline — Chunk documentation and index text for search retrieval.",
          "Phase 2: Search Retrieval — Build semantic query matching to fetch relevant document contexts.",
          "Phase 3: Response Generation — Integrate LLM completions with strict grounding prompts.",
          "Phase 4: Session Management — Maintain multi-turn conversation history per user session.",
          "Phase 5: Safety & Testing — Add hallucination guards and fallback escalation logic.",
        ],
      },
    ];
  }

  // 2. Healthcare / Clinical / Medical domain
  if (has("health", "clinic", "patient", "doctor", "medical", "hospital", "telehealth")) {
    return [
      {
        id: "health-appointments",
        icon: "🏥",
        title: "Clinical Appointment & Triage Platform",
        problem:
          "Outpatient clinics struggle with scheduling bottlenecks, no-shows, and manual triage. Build a unified scheduling and triage system with automated patient notifications.",
        whatYouBuild:
          "A clinical scheduling and patient intake application with provider calendars, automated appointment confirmation, and symptom check-in workflows.",
        features: [
          "Provider calendar management with slot availability rules",
          "Patient self-service booking with automated confirmation",
          "Digital symptom intake and triage status tags",
          "Role-based access control for doctors, nurses, and administrative staff",
          "Automated reminder dispatch to mitigate appointment no-show rates",
        ],
        buildSteps: [
          "Phase 1: Domain Modeling — Define doctor profiles, availability slots, and patient appointment schemas.",
          "Phase 2: Booking Engine — Implement concurrency-safe slot reservation and status transition state machines.",
          "Phase 3: Clinical Dashboard — Build doctor schedule views and patient check-in queues.",
          "Phase 4: Notification Pipeline — Integrate reminder alerts and email/SMS confirmation workflows.",
          "Phase 5: Security & Testing — Enforce HIPAA/privacy access policies and audit logging.",
        ],
      },
      {
        id: "health-records",
        icon: "📋",
        title: "Electronic Health Record (EHR) Portal",
        problem:
          "Patients lack consolidated access to lab reports and medical history. Build a secure patient portal allowing patients to view medical records and prescriptions.",
        whatYouBuild:
          "A secure health record management portal with document encryption, prescription tracking, and timeline visualization.",
        features: [
          "Consolidated medical timeline visualizing consultations and lab tests",
          "Encrypted document storage for clinical diagnostic reports",
          "Digital prescription renewal requests and pharmacy status updates",
          "Emergency contact information and allergy warning flags",
          "Granular consent management allowing patients to grant temporary doctor access",
        ],
        buildSteps: [
          "Phase 1: Secure Data Architecture — Configure encrypted storage and strict access controls.",
          "Phase 2: Timeline Engine — Assemble patient consultation history into a chronological timeline.",
          "Phase 3: Document Uploads — Build authenticated file upload with metadata tagging.",
          "Phase 4: Access Delegation — Implement time-bound token sharing for specialist reviews.",
          "Phase 5: Audit Trails — Log every record access event with timestamp and actor identity.",
        ],
      },
      {
        id: "health-vitals",
        icon: "❤️",
        title: "Remote Patient Monitoring & Alerts",
        problem:
          "Chronic patients need continuous vitals tracking outside the hospital. Build a telemetry monitoring dashboard with automated alert thresholds.",
        whatYouBuild:
          "A real-time remote monitoring service that records vitals telemetry (blood pressure, glucose, pulse) and raises clinician alerts.",
        features: [
          "Vitals telemetry time-series logging API",
          "Dynamic anomaly alert thresholds configured per patient",
          "Real-time clinician alert notifications on critical readings",
          "Trend visualization charts showing 7-day and 30-day vitals progression",
          "Weekly health summary report generation for attending physicians",
        ],
        buildSteps: [
          "Phase 1: Time-Series Storage — Design high-throughput vitals metric ingestion schemas.",
          "Phase 2: Threshold Engine — Evaluate incoming metrics against personalized clinical safe ranges.",
          "Phase 3: Alert System — Dispatch immediate clinician notifications upon out-of-range readings.",
          "Phase 4: Visualization UI — Render interactive vitals charts with baseline reference lines.",
          "Phase 5: Resilience Testing — Verify ingestion reliability under intermittent device connectivity.",
        ],
      },
      {
        id: "health-inventory",
        icon: "💊",
        title: "Hospital Pharmacy Inventory Management",
        problem:
          "Hospitals face stock-outs and expired medication waste. Build a pharmacy inventory system tracking batch numbers, expiry dates, and automated reorder alerts.",
        whatYouBuild:
          "A pharmaceutical stock management system with batch expiration tracking, automated reorder triggers, and dispensing audit trails.",
        features: [
          "Batch-level medication stock tracking with expiration date alerts",
          "Automated replenishment purchase orders when stock hits safety thresholds",
          "Prescription dispensing verification workflow matching patient IDs",
          "Controlled substance access logging and digital sign-offs",
          "Stock wastage and burn-rate analytics dashboards",
        ],
        buildSteps: [
          "Phase 1: Inventory Schema — Model medications, batches, manufacturers, and stock locations.",
          "Phase 2: Dispense Workflow — Build barcode/ID verification for medication disbursement.",
          "Phase 3: Threshold Triggers — Create automated low-stock and upcoming-expiry notification jobs.",
          "Phase 4: Audit Logging — Enforce immutable logs for controlled medication handoffs.",
          "Phase 5: Reporting — Build consumption analytics and supplier performance reports.",
        ],
      },
    ];
  }

  // 3. E-commerce / Marketplace projects
  if (has("ecommerce", "e-commerce", "cart", "shop", "store", "order", "product", "checkout")) {
    return [
      {
        id: "ecom-inventory",
        icon: "📦",
        title: "Real-Time Inventory & Flash Sale System",
        problem:
          "High-traffic flash sales cause inventory overselling and database lockups. Build a concurrency-safe order placement service with atomic stock reservation.",
        whatYouBuild:
          "A high-throughput e-commerce checkout service utilizing distributed locks or atomic decrement operations to prevent overselling.",
        features: [
          "Atomic inventory decrement with rollback on failed checkout",
          "Time-limited cart reservations during payment completion",
          "Idempotent payment webhook processing to prevent double charges",
          "Real-time stock level broadcasting via WebSockets",
          "Order fulfillment workflow tracking with status transitions",
        ],
        buildSteps: [
          "Phase 1: Schema Architecture — Model products, variants, reservations, and orders.",
          "Phase 2: Concurrency Controls — Implement atomic reservation operations to prevent race conditions.",
          "Phase 3: Checkout Pipeline — Build multi-step order checkout with payment intent creation.",
          "Phase 4: Webhook Resilience — Add idempotent processing for asynchronous payment callbacks.",
          "Phase 5: Load Testing — Simulate thousands of concurrent checkouts to verify zero overselling.",
        ],
      },
      {
        id: "ecom-marketplace",
        icon: "🏪",
        title: "Multi-Vendor Marketplace Management",
        problem:
          "Marketplaces struggle with multi-seller order splitting, commission accounting, and vendor payouts. Build a multi-tenant seller management system.",
        whatYouBuild:
          "A multi-vendor portal handling seller onboarding, catalog approval, split-order fulfillment, and automated payout calculations.",
        features: [
          "Vendor onboarding portal with catalog submission and verification",
          "Split order routing allowing customers to buy from multiple sellers in one cart",
          "Automated commission calculation and seller payout accounting",
          "Vendor-specific fulfillment and tracking number dispatch",
          "Customer dispute management and refund resolution workflow",
        ],
        buildSteps: [
          "Phase 1: Multi-Tenant Schema — Design vendor, product, sub-order, and payout entities.",
          "Phase 2: Catalog Workflow — Implement vendor submission with admin moderation queues.",
          "Phase 3: Order Splitting — Split unified customer cart into vendor-specific fulfillment items.",
          "Phase 4: Financial Accounting — Calculate platform commission fees and vendor net payouts.",
          "Phase 5: Vendor Dashboard — Provide sellers with order metrics, revenue graphs, and shipping tools.",
        ],
      },
      {
        id: "ecom-subscription",
        icon: "🔄",
        title: "Subscription Box & Recurring Billing",
        problem:
          "Businesses need predictable recurring revenue. Build a subscription management platform supporting customized delivery cadences and customer plan management.",
        whatYouBuild:
          "A recurring subscription billing engine with automated dunning, customer pause/resume capabilities, and fulfillment batch scheduling.",
        features: [
          "Custom subscription cadence selection (weekly, bi-weekly, monthly)",
          "Customer self-service portal to pause, skip, or modify subscription items",
          "Automated recurring invoice generation and payment retry handling",
          "Batch fulfillment generation for upcoming scheduled deliveries",
          "Subscriber churn telemetry and cancellation feedback capture",
        ],
        buildSteps: [
          "Phase 1: Subscription Models — Create recurring billing plans, subscriber profiles, and intervals.",
          "Phase 2: Scheduling Worker — Implement cron/worker jobs generating invoices on billing dates.",
          "Phase 3: Self-Service Portal — Allow users to modify their delivery schedules and product preferences.",
          "Phase 4: Dunning Flow — Handle expired cards and failed charges with automated customer emails.",
          "Phase 5: Retention Analytics — Build metrics tracking Monthly Recurring Revenue (MRR) and churn rate.",
        ],
      },
      {
        id: "ecom-reviews",
        icon: "⭐",
        title: "Verified Buyer Review & UGC Platform",
        problem:
          "Fake reviews erode buyer trust. Build a verified-purchaser review platform featuring media uploads, helpfulness upvoting, and sentiment aggregation.",
        whatYouBuild:
          "A verified product rating and feedback system that validates purchase receipts, manages image uploads, and scores product sentiment.",
        features: [
          "Verified buyer validation restricting reviews to confirmed order customers",
          "Customer image and video unboxing attachment uploads",
          "Helpful/unhelpful community voting with reputation weighting",
          "Automated profanity and spam moderation filtering",
          "Rating breakdown analytics showing aggregate satisfaction scores",
        ],
        buildSteps: [
          "Phase 1: Verification Engine — Verify purchaser credentials before permitting review creation.",
          "Phase 2: Media Ingestion — Build secure image attachment upload and thumbnail generation.",
          "Phase 3: Moderation Filters — Implement automated keyword and toxicity screening.",
          "Phase 4: Voting & Scoring — Calculate net helpfulness scores and highlight top reviews.",
          "Phase 5: Aggregate Ratings — Compute weighted star ratings and rating distribution metrics.",
        ],
      },
    ];
  }

  // 4. Default / General Full-Stack & Developer Tools
  return [
    {
      id: "platform-collab",
      icon: "👥",
      title: "Team Collaboration & Workspace Hub",
      problem:
        "Distributed engineering teams struggle with siloed communications and fragmented task management. Build a real-time collaborative workspace with activity feeds.",
      whatYouBuild:
        "A real-time team collaboration platform with project boards, task tracking, rich-text notes, and instant team activity feeds.",
      features: [
        "Kanban task board with real-time drag-and-drop state synchronization",
        "Team workspace permissions with role-based member management",
        "Activity audit timeline showing team modifications in real-time",
        "Integrated file attachments and documentation notes editor",
        "Email/in-app notifications for task assignments and deadline alerts",
      ],
      buildSteps: [
        "Phase 1: Architecture & Auth — Setup project structure, database models, and role-based authentication.",
        "Phase 2: Workspace Data Modeling — Design schemas for organizations, workspaces, boards, and tasks.",
        "Phase 3: Board Implementation — Build task status columns, drag-and-drop actions, and filter controls.",
        "Phase 4: Real-Time Sync — Connect event-driven updates for instantaneous team-wide changes.",
        "Phase 5: Polish & Deployment — Implement audit logs, automated testing, and cloud deployment.",
      ],
    },
    {
      id: "platform-api",
      icon: "🔌",
      title: "High-Performance API Service & Gateway",
      problem:
        "External clients overload backend systems without rate limits or caching. Build an API gateway service with authentication, request throttling, and telemetry.",
      whatYouBuild:
        "A robust API service with token-based authentication, rate limiting, request validation, and comprehensive metrics tracking.",
      features: [
        "API key and JWT authentication with granular scope permissions",
        "Sliding-window rate limiter protecting upstream service endpoints",
        "In-memory caching layer accelerating high-frequency read endpoints",
        "Structured logging with correlation IDs for distributed tracing",
        "Live health check and operational metrics endpoint dashboard",
      ],
      buildSteps: [
        "Phase 1: API Scaffolding — Setup server routing, middleware pipeline, and database connectors.",
        "Phase 2: Auth & Scopes — Implement token verification and endpoint permission middleware.",
        "Phase 3: Rate Limiting — Build memory/Redis-backed request counters with custom HTTP headers.",
        "Phase 4: Caching Strategy — Integrate caching headers and invalidate cache on data mutations.",
        "Phase 5: Observability — Add Prometheus/custom metrics endpoints and automated load tests.",
      ],
    },
    {
      id: "platform-analytics",
      icon: "📊",
      title: "Real-Time Telemetry & Operations Dashboard",
      problem:
        "Operations engineers cannot diagnose system issues without centralized metrics. Build an event telemetry dashboard aggregating logs and performance metrics.",
      whatYouBuild:
        "A metric ingestion and visualization dashboard displaying real-time system performance, error logs, and customizable visual graphs.",
      features: [
        "Event ingestion endpoint supporting batch telemetry payloads",
        "Aggregated time-series calculations for p95 latency and error counts",
        "Interactive dashboard charts with custom date-range filters",
        "Automated threshold alert rules dispatching notifications",
        "Searchable event log table with multi-attribute filtering",
      ],
      buildSteps: [
        "Phase 1: Pipeline Setup — Establish high-throughput ingestion endpoint with payload validation.",
        "Phase 2: Aggregation Logic — Compute rolling metric statistics across configurable time windows.",
        "Phase 3: Dashboard Interface — Build visual cards displaying vital metrics and historical graphs.",
        "Phase 4: Search & Filters — Implement fast indexing for log search and status filtering.",
        "Phase 5: Resiliency Testing — Benchmark ingestion speed and optimize database queries.",
      ],
    },
    {
      id: "platform-workflow",
      icon: "⚡",
      title: "Automated Workflow & Event Dispatcher",
      problem:
        "Manual business processes slow down operations. Build an event-driven automation pipeline that triggers multi-step tasks based on business events.",
      whatYouBuild:
        "An asynchronous job dispatcher that listens to system events, executes workflow sequences, and manages retry queues with exponential backoff.",
      features: [
        "Event listener queue with worker job consumer processes",
        "Configurable multi-step workflow execution engine",
        "Dead-letter queue with automated retry and exponential backoff",
        "Webhook notification dispatch to third-party endpoints",
        "Administrative dashboard monitoring active and failed jobs",
      ],
      buildSteps: [
        "Phase 1: Queue Architecture — Configure background worker queues with message persistence.",
        "Phase 2: Job Dispatcher — Implement job producers and concurrency-controlled consumers.",
        "Phase 3: Retry Policies — Build failure detection, backoff timing, and dead-letter storage.",
        "Phase 4: Webhook Dispatch — Trigger external webhooks with HMAC signature verification.",
        "Phase 5: Admin Controls — Build administrative retry/purge controls and execution telemetry.",
      ],
    },
  ];
}

/**
 * Normalizes any project object (database or AI generated) into a comprehensive
 * Project Implementation Guide data structure.
 */
export function buildProjectGuide(proj) {
  if (!proj) return null;

  // Unpack if wrapped in recommendation container
  const raw = proj.project || proj;

  const title = raw.title || "Project Implementation Guide";
  const description = raw.description || "";
  const difficulty = raw.difficulty || "Intermediate";

  // Normalize skills and techStack arrays
  const rawTech = raw.techStack || raw.technologies || raw.skills || [];
  const techStack = Array.isArray(rawTech)
    ? rawTech
    : typeof rawTech === "string"
    ? rawTech.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawSkills = raw.skills || raw.technologies || raw.techStack || [];
  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
    ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Core features: support raw.keyFeatures or raw.features or provide clean fallbacks
  let features = [];
  if (Array.isArray(raw.keyFeatures) && raw.keyFeatures.length > 0) {
    features = raw.keyFeatures;
  } else if (Array.isArray(raw.features) && raw.features.length > 0) {
    features = raw.features;
  } else {
    features = [
      `Modular system architecture engineered with ${techStack.slice(0, 3).join(", ") || "target technologies"}`,
      "Structured data validation and secure API endpoints",
      "Interactive, responsive user interface with accessible feedback",
      "Production-ready deployment setup with environment configuration",
    ];
  }

  // Development steps: support raw.roadmap or raw.buildSteps
  let buildSteps = [];
  if (Array.isArray(raw.roadmap) && raw.roadmap.length > 0) {
    buildSteps = raw.roadmap.map((step, idx) =>
      step.startsWith("Phase") ? step : `Phase ${idx + 1}: ${step}`
    );
  } else if (Array.isArray(raw.buildSteps) && raw.buildSteps.length > 0) {
    buildSteps = raw.buildSteps;
  } else {
    buildSteps = [
      "Phase 1: Architecture & Setup — Initialize project repository, configure tooling, dependencies, and environment variables.",
      "Phase 2: Schema & Data Flow — Design data models, state architecture, and API endpoint contracts.",
      "Phase 3: Core Implementation — Develop the primary business logic, request validation, and UI or service layer.",
      "Phase 4: Testing & Hardening — Validate edge cases, implement error boundaries, and verify integration.",
      "Phase 5: Documentation & Deployment — Write a comprehensive README with architecture diagrams and deploy live.",
    ];
  }

  // Resume value & interview value
  const resumeValue =
    raw.resumeValue ||
    raw.whyRecommended ||
    raw.reason ||
    `Adds verifiable portfolio evidence demonstrating hands-on proficiency in ${techStack.join(", ") || "modern industry tools"}.`;

  const interviewValue =
    raw.interviewValue ||
    `Provides concrete architectural discussion points covering design decisions, trade-offs, and production considerations during technical interviews.`;

  // Matched resources from OFFICIAL_DOCS
  const resources = [];
  if (Array.isArray(raw.resources) && raw.resources.length > 0) {
    raw.resources.forEach((r) => resources.push(r));
  } else {
    const combinedTokens = [...techStack, ...skills];
    combinedTokens.forEach((token) => {
      const clean = String(token).toLowerCase().trim();
      if (OFFICIAL_DOCS[clean] && !resources.some((r) => r.url === OFFICIAL_DOCS[clean].url)) {
        resources.push(OFFICIAL_DOCS[clean]);
      }
    });
  }

  // Problem statements (4 real-world scenarios)
  const problemStatements = getProblemStatements({ ...raw, techStack, skills });

  return {
    ...raw,
    title,
    description,
    difficulty,
    techStack: techStack.length > 0 ? techStack : ["Modern Web Stack"],
    skills: skills.length > 0 ? skills : techStack,
    features,
    buildSteps,
    resumeValue,
    interviewValue,
    resources,
    problemStatement: raw.problemStatement || "",
    problemStatements,
  };
}

/**
 * Reusable Project Implementation Guide Modal component.
 */
export default function ProjectGuideModal({ project, onClose }) {
  const [selectedProblem, setSelectedProblem] = useState(null);

  if (!project) return null;

  const guide = buildProjectGuide(project);

  return (
    <div className="project-guide-modal-overlay" onClick={onClose}>
      <div
        className="project-guide-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <div className="modal-header">
          <div>
            <span className="modal-badge">
              🛠️ Project Implementation Guide
            </span>
            <h2 id="guide-title">{guide.title}</h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Guide"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Real-World Problem Section with 4 Options */}
          <div className="modal-section real-world-picker-section">
            <div className="picker-heading-row">
              <h4>🎯 Choose a Real-World Problem</h4>
              <span className="picker-hint">
                Select a specific scenario to tailor your implementation guide
              </span>
            </div>

            <div className="problems-selection-grid">
              {(guide.problemStatements || []).map((problem) => {
                const isSelected = selectedProblem?.id === problem.id;

                return (
                  <div
                    key={problem.id}
                    className={`problem-card ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      setSelectedProblem(isSelected ? null : problem)
                    }
                  >
                    <div className="problem-card-header">
                      <span className="problem-icon">{problem.icon}</span>
                      <h5 className="problem-title">{problem.title}</h5>
                    </div>

                    <p className="problem-desc">{problem.problem}</p>

                    <button
                      type="button"
                      className={`problem-choose-btn ${
                        isSelected ? "chosen" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProblem(isSelected ? null : problem);
                      }}
                    >
                      {isSelected ? "✓ Selected" : "Choose"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Selected Scenario Notification Banner */}
            {selectedProblem && (
              <div className="selected-problem-banner">
                <div className="selected-problem-top">
                  <span className="selected-problem-tag">
                    🎯 Active Scenario Context
                  </span>
                  <button
                    type="button"
                    className="clear-selection-btn"
                    onClick={() => setSelectedProblem(null)}
                  >
                    Reset to Generic Guide ✕
                  </button>
                </div>
                <h4 className="selected-problem-name">
                  {selectedProblem.icon} {selectedProblem.title}
                </h4>
                <p className="selected-problem-summary">
                  {selectedProblem.problem}
                </p>
              </div>
            )}
          </div>

          {/* Objective & What to Build */}
          <div className="modal-section">
            <h4>
              {selectedProblem ? "💡 What You'll Build" : "🎯 Objective & What to Build"}
            </h4>
            <p>
              {selectedProblem
                ? selectedProblem.whatYouBuild
                : guide.description}
            </p>
          </div>

          {/* Real-World Problem Statement (from AI or base) */}
          {guide.problemStatement && !selectedProblem && (
            <div className="modal-section">
              <h4>🔍 Problem Statement</h4>
              <p>{guide.problemStatement}</p>
            </div>
          )}

          {/* Suggested Tech Stack */}
          <div className="modal-section">
            <h4>💻 Suggested Tech Stack</h4>
            <div className="modal-tech-stack">
              {guide.techStack.map((tech, i) => (
                <span className="tech-badge" key={i}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Core Features */}
          <div className="modal-section">
            <h4>⚡ Core Features</h4>
            <ul className="modal-feature-list">
              {(selectedProblem ? selectedProblem.features : guide.features).map(
                (feat, i) => (
                  <li key={i}>{feat}</li>
                )
              )}
            </ul>
          </div>

          {/* Suggested Development Steps */}
          <div className="modal-section">
            <h4>📋 Suggested Development Steps</h4>
            <div className="modal-steps-list">
              {(selectedProblem
                ? selectedProblem.buildSteps
                : guide.buildSteps
              ).map((step, i) => (
                <div className="modal-step-item" key={i}>
                  <span className="step-num">{i + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Demonstrated */}
          <div className="modal-section">
            <h4>🎓 Skills You'll Demonstrate</h4>
            <div className="modal-skills-list">
              {guide.skills.map((skill, i) => (
                <span className="modal-skill-pill" key={i}>
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume & Interview Value Callouts */}
          <div className="modal-section-grid">
            <div className="modal-callout resume-callout">
              <h5>📄 Resume Value</h5>
              <p>
                {selectedProblem
                  ? `Proves practical competence in ${guide.techStack.join(
                      ", "
                    )} by demonstrating an end-to-end solution for ${
                      selectedProblem.title
                    }.`
                  : guide.resumeValue}
              </p>
            </div>
            <div className="modal-callout interview-callout">
              <h5>💼 Interview Value</h5>
              <p>
                {selectedProblem
                  ? `Gives you concrete architectural scenarios to explain in technical interviews: database schemas, API lifecycle handling, and trade-offs for ${selectedProblem.title}.`
                  : guide.interviewValue}
              </p>
            </div>
          </div>

          {/* Technical Documentation Resources */}
          <div className="modal-section">
            <h4>📚 Verified Technical Documentation</h4>
            {guide.resources && guide.resources.length > 0 ? (
              <div className="modal-resource-links">
                {guide.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="modal-doc-link"
                  >
                    🔗 {res.name} ↗
                  </a>
                ))}
              </div>
            ) : (
              <div className="modal-resource-links">
                <a
                  href="https://developer.mozilla.org"
                  target="_blank"
                  rel="noreferrer"
                  className="modal-doc-link"
                >
                  🌐 Official Developer Documentation ↗
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-done-btn" onClick={onClose}>
            Close Project Guide
          </button>
        </div>
      </div>
    </div>
  );
}
