import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import Sidebar from "../../components/student/Sidebar";
import Topbar from "../../components/student/Topbar";

import "./ResumeAnalyzer.css";

// Curated verified official technical documentation
const OFFICIAL_DOCS = {
  react: { name: "React Official Docs", url: "https://react.dev" },
  "node.js": { name: "Node.js Documentation", url: "https://nodejs.org/docs" },
  nodejs: { name: "Node.js Documentation", url: "https://nodejs.org/docs" },
  express: { name: "Express.js Guide", url: "https://expressjs.com" },
  "express.js": { name: "Express.js Guide", url: "https://expressjs.com" },
  mongodb: { name: "MongoDB Manual", url: "https://www.mongodb.com/docs" },
  docker: { name: "Docker Documentation", url: "https://docs.docker.com" },
  python: { name: "Python Documentation", url: "https://docs.python.org/3/" },
  typescript: { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
  javascript: { name: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  git: { name: "Git Documentation", url: "https://git-scm.com/doc" },
  sql: { name: "PostgreSQL / SQL Docs", url: "https://www.postgresql.org/docs/" },
  postgresql: { name: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/" },
  java: { name: "Oracle Java Docs", url: "https://docs.oracle.com/en/java/" },
  "spring boot": { name: "Spring Boot Reference", url: "https://spring.io/projects/spring-boot" },
  "next.js": { name: "Next.js Documentation", url: "https://nextjs.org/docs" },
  nextjs: { name: "Next.js Documentation", url: "https://nextjs.org/docs" },
  redux: { name: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org" },
  "rest api": { name: "RESTful API Standards", url: "https://restfulapi.net" },
  "rest apis": { name: "RESTful API Standards", url: "https://restfulapi.net" },
  jwt: { name: "JWT Introduction", url: "https://jwt.io/introduction" },
};

/**
 * Intelligent helper to select EXACTLY 4 domain-relevant real-world problem
 * statements based on the recommended project's title, description, skills, and tech stack.
 */
function getProblemStatements(proj) {
  if (!proj) return [];

  const text = `${proj.title || ""} ${proj.description || ""} ${(proj.skills || []).join(" ")} ${(proj.techStack || []).join(" ")} ${proj.reason || ""}`.toLowerCase();
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
        title: "Product Recommendation Engine",
        problem:
          "E-commerce stores struggle to personalize item discovery. Build a recommendation engine that serves tailored product suggestions based on user shopping history.",
        whatYouBuild:
          "A personalized recommendation service computing collaborative item similarities and real-time 'frequently bought together' suggestions.",
        features: [
          "User interaction logging (views, cart adds, and purchases)",
          "Content-based and collaborative similarity calculation",
          "Personalized top-N recommendation query endpoint",
          "Cold-start fallback strategy for new visitors",
          "Recommendation performance and conversion tracking",
        ],
        buildSteps: [
          "Phase 1: Architecture Setup — Set up server and datastore for user interaction events.",
          "Phase 2: Interaction Tracking — Build high-throughput event logging endpoints.",
          "Phase 3: Similarity Engine — Compute item-to-item similarity matrices from purchase history.",
          "Phase 4: Recommendation Serving — Implement low-latency recommendation endpoints with caching.",
          "Phase 5: Fallbacks & Testing — Handle cold-start scenarios and verify response times.",
        ],
      },
      {
        id: "ai-support",
        icon: "💬",
        title: "Context-Aware Support Assistant",
        problem:
          "Support teams are overwhelmed by repetitive queries. Build an AI assistant API that answers user questions using product documentation with accurate citations.",
        whatYouBuild:
          "A knowledge-grounded support assistant API that indexes documentation and generates factual, referenced answers to customer inquiries.",
        features: [
          "Documentation chunking and semantic vector search",
          "Grounded response generation with source link citations",
          "Conversation session state and context persistence",
          "Confidence threshold evaluation with human handoff trigger",
          "Feedback loop logging for thumbs up/down responses",
        ],
        buildSteps: [
          "Phase 1: Ingestion Pipeline — Chunk product manuals and index text for search retrieval.",
          "Phase 2: Search Retrieval — Build semantic query matching to fetch relevant document contexts.",
          "Phase 3: Response Generation — Integrate LLM completions with strict grounding prompts.",
          "Phase 4: Session Management — Maintain multi-turn conversation history per user session.",
          "Phase 5: Safety & Testing — Add hallucination guards and fallback escalation logic.",
        ],
      },
    ];
  }

  // 2. Data Science / Analytics projects
  if (
    has(
      "data science",
      "data analysis",
      "pandas",
      "numpy",
      "analytics",
      "visualization",
      "dataset",
      "statistics",
      "churn",
      "forecasting"
    )
  ) {
    return [
      {
        id: "ds-sales",
        icon: "📈",
        title: "Sales & Demand Forecasting",
        problem:
          "Retailers lose revenue from stockouts and overstocking. Build a predictive pipeline that forecasts product sales trends from historical time-series data.",
        whatYouBuild:
          "A time-series forecasting pipeline that cleans sales history, extracts seasonal patterns, and generates next-month demand predictions.",
        features: [
          "Historical sales trend cleaning and seasonality decomposition",
          "Rolling window and lag feature engineering",
          "Model training and error evaluation (RMSE/MAPE)",
          "Interactive demand forecast generation with confidence intervals",
          "Anomaly detection for unexpected sales spikes and dips",
        ],
        buildSteps: [
          "Phase 1: Data Ingestion — Load and clean historical sales transaction records.",
          "Phase 2: Feature Engineering — Generate lag variables, rolling means, and day-of-week indicators.",
          "Phase 3: Model Training — Train baseline and regression models on time-split datasets.",
          "Phase 4: Forecast Generation — Produce forward-looking demand projections with variance bands.",
          "Phase 5: Evaluation & Report — Output summary accuracy metrics and visualization plots.",
        ],
      },
      {
        id: "ds-churn",
        icon: "👥",
        title: "Customer Churn Predictor",
        problem:
          "SaaS companies struggle to identify at-risk customers before they cancel. Build an analytics model that flags accounts with declining usage patterns.",
        whatYouBuild:
          "A churn prediction pipeline that ingests customer activity metrics, calculates churn probabilities, and identifies top risk drivers.",
        features: [
          "User activity aggregation from login and feature usage logs",
          "Class imbalance handling and feature normalization",
          "Binary classification model predicting 30-day cancellation risk",
          "Feature importance ranking identifying top reasons for churn",
          "Automated high-risk customer report export",
        ],
        buildSteps: [
          "Phase 1: Data Aggregation — Join subscription, billing, and activity log datasets.",
          "Phase 2: Feature Engineering — Compute frequency drop-off ratios and engagement scores.",
          "Phase 3: Model Development — Train and tune classification models with cross-validation.",
          "Phase 4: Explainability — Extract top feature importances to highlight churn drivers.",
          "Phase 5: Output Pipeline — Generate automated risk score exports for retention teams.",
        ],
      },
      {
        id: "ds-rfm",
        icon: "🎯",
        title: "Customer RFM Segmentation",
        problem:
          "Marketing teams waste budget sending generic campaigns. Build an RFM segmentation model to cluster buyers into distinct behavioral personas.",
        whatYouBuild:
          "An automated customer clustering model using Recency, Frequency, and Monetary metrics to segment buyers for targeted marketing.",
        features: [
          "Recency, Frequency, and Monetary score computation per customer",
          "Outlier filtering and logarithmic feature scaling",
          "K-Means clustering with optimal cluster validation",
          "Persona profiling (Champions, Loyalists, At Risk, Lost)",
          "Visual cluster distribution plots and segment revenue breakdowns",
        ],
        buildSteps: [
          "Phase 1: Transaction Processing — Aggregate raw order data into customer-level RFM metrics.",
          "Phase 2: Data Scaling — Normalize skewed monetary and frequency distributions.",
          "Phase 3: Cluster Optimization — Determine optimal cluster count using Elbow/Silhouette methods.",
          "Phase 4: Persona Mapping — Label clusters with actionable marketing persona definitions.",
          "Phase 5: Insights Export — Output segment summaries and campaign recommendations.",
        ],
      },
      {
        id: "ds-anomaly",
        icon: "🔍",
        title: "Financial Anomaly Detector",
        problem:
          "Auditing teams must identify fraudulent expense reports and duplicate billing across millions of accounting records.",
        whatYouBuild:
          "An unsupervised anomaly detection pipeline using statistical outlier scoring to surface irregular ledger transactions.",
        features: [
          "Multivariate transaction feature standardization",
          "Isolation Forest / statistical Z-score outlier detection",
          "Configurable anomaly threshold tuning with false-positive controls",
          "Interactive outlier distribution visualizations",
          "Automated audit review list generation with anomaly scores",
        ],
        buildSteps: [
          "Phase 1: Ledger Ingestion — Load and normalize accounting transaction entries.",
          "Phase 2: Statistical Profiling — Calculate baseline distributions for expense categories.",
          "Phase 3: Anomaly Modeling — Apply Isolation Forest to compute transaction anomaly scores.",
          "Phase 4: Threshold Calibration — Calibrate detection boundaries against verified audit samples.",
          "Phase 5: Report Delivery — Generate flagged transaction reports for auditor review.",
        ],
      },
    ];
  }

  // 3. React / Frontend focused projects
  if (
    has(
      "react",
      "frontend",
      "ui",
      "ux",
      "redux",
      "tailwind",
      "client",
      "next.js",
      "vue",
      "dashboard"
    ) &&
    !has("docker", "microservice", "backend")
  ) {
    return [
      {
        id: "react-expense",
        icon: "💰",
        title: "Personal Expense & Budget Tracker",
        problem:
          "Individuals struggle to stick to monthly budgets without clear spending breakdowns. Build an interactive React app with visual charts and budget alerts.",
        whatYouBuild:
          "A responsive React personal finance tracker with category budgets, interactive spending charts, and local persistence.",
        features: [
          "Dynamic transaction entry with category, date, and receipt notes",
          "Interactive spending breakdown charts by category and month",
          "Budget progress rings with threshold warning alerts",
          "Multi-filter search (date range, category, payment type)",
          "Data export to CSV and responsive mobile layout",
        ],
        buildSteps: [
          "Phase 1: UI Scaffolding — Initialize Vite/React app and configure theme system and layout.",
          "Phase 2: State Architecture — Build context/custom hooks for transactions and budget limits.",
          "Phase 3: Chart Visualizations — Integrate interactive charts for monthly category trends.",
          "Phase 4: Filtering & Budgets — Implement dynamic filters, search, and budget progress calculations.",
          "Phase 5: Polish & Storage — Add local storage synchronization and responsive mobile polishing.",
        ],
      },
      {
        id: "react-booking",
        icon: "🩺",
        title: "Clinic Appointment Booking Portal",
        problem:
          "Patients face frustration booking appointments over phone calls. Build a sleek React booking portal with doctor directories, calendar slot selection, and booking confirmations.",
        whatYouBuild:
          "A patient-facing React appointment scheduler featuring doctor filtering, calendar time-slot selection, and reservation state management.",
        features: [
          "Doctor catalog with specialty filtering, bios, and ratings",
          "Interactive calendar with real-time available time slot picker",
          "Multi-step booking wizard with form validation",
          "Appointment management dashboard (view, reschedule, cancel)",
          "Instant visual confirmation cards and calendar export",
        ],
        buildSteps: [
          "Phase 1: Component Hierarchy — Design layout, routing, and doctor directory components.",
          "Phase 2: Slot Selection Calendar — Build custom calendar with availability indicators.",
          "Phase 3: Booking Flow — Implement multi-step reservation form with input validation.",
          "Phase 4: State Management — Manage active reservations and appointment cancellations.",
          "Phase 5: Usability Polish — Add accessible ARIA labels, loading skeletons, and responsive styling.",
        ],
      },
      {
        id: "react-inventory",
        icon: "📦",
        title: "Retail Stock & Inventory Dashboard",
        problem:
          "Warehouse workers need a fast, responsive interface to manage stock, flag low inventory, and update product quantities without reloading pages.",
        whatYouBuild:
          "A high-performance React inventory dashboard with live search, batch stock adjustments, and reorder threshold badges.",
        features: [
          "Paginated data table with instant multi-column sorting and filtering",
          "Visual stock status indicators (In Stock, Low Stock, Depleted)",
          "Modal workflows for quick quantity adjustments and item additions",
          "Low-stock alert banner with one-click reorder suggestions",
          "Summary statistics cards for total inventory valuation and SKU counts",
        ],
        buildSteps: [
          "Phase 1: Dashboard Layout — Set up component grid with stat cards and table container.",
          "Phase 2: Table State — Implement client-side sorting, pagination, and instant search.",
          "Phase 3: Modal Actions — Build quantity update and new product creation modals.",
          "Phase 4: Alert System — Add dynamic threshold indicators and reorder action buttons.",
          "Phase 5: Performance — Optimize table rendering and verify keyboard navigation.",
        ],
      },
      {
        id: "react-learning",
        icon: "🎓",
        title: "Student Interactive Learning Portal",
        problem:
          "Students drop out of online courses due to lack of visual milestones. Build an engaging learning dashboard with course progress bars, quizzes, and study streaks.",
        whatYouBuild:
          "An engaging student learning dashboard tracking course progress, lesson milestones, interactive quizzes, and daily study streaks.",
        features: [
          "Visual course roadmap with locked/unlocked module milestones",
          "Interactive lesson player with checklist progress tracking",
          "Embedded multiple-choice quiz module with instant score feedback",
          "Daily study streak counter and achievement badge rewards",
          "Bookmarking and study notes quick-access drawer",
        ],
        buildSteps: [
          "Phase 1: Layout & Routes — Scaffold student dashboard navigation and module pages.",
          "Phase 2: Progress State — Build state store managing completed lessons and quiz scores.",
          "Phase 3: Interactive Roadmap — Create visual course tree showing current learning path.",
          "Phase 4: Quiz Engine — Implement interactive quiz component with score calculations.",
          "Phase 5: Polish — Add celebratory completion animations and mobile layout support.",
        ],
      },
    ];
  }

  // 4. Cloud / DevOps / Microservices projects
  if (
    has(
      "docker",
      "container",
      "kubernetes",
      "ci/cd",
      "devops",
      "cloud",
      "aws",
      "pipeline",
      "microservice",
      "infrastructure"
    )
  ) {
    return [
      {
        id: "devops-microservice",
        icon: "🐳",
        title: "Containerized Microservices Architecture",
        problem:
          "Monolithic applications suffer from slow builds and single-point failures. Build a decoupled, containerized backend running on Docker with cached service endpoints.",
        whatYouBuild:
          "A containerized Node/Express microservice orchestrated with Docker Compose, Redis caching, and health check monitoring.",
        features: [
          "Multi-stage Dockerfile optimized for minimal image footprint",
          "Docker Compose orchestration connecting Node, MongoDB, and Redis",
          "Redis caching layer for high-throughput endpoint acceleration",
          "Container health check endpoints (`/health`, `/metrics`) and graceful shutdown",
          "Structured JSON logging with correlation IDs for container log aggregation",
        ],
        buildSteps: [
          "Phase 1: Service Architecture — Build Express API with data persistence and Redis caching.",
          "Phase 2: Containerization — Write multi-stage Dockerfile optimizing layers and cache.",
          "Phase 3: Compose Orchestration — Write docker-compose.yml linking app, db, and cache.",
          "Phase 4: Resiliency & Health — Add health check routes, signal traps, and error boundaries.",
          "Phase 5: Deployment Testing — Verify container networking, volume mounts, and load testing.",
        ],
      },
      {
        id: "devops-cicd",
        icon: "⚙️",
        title: "Automated CI/CD Delivery Pipeline",
        problem:
          "Manual releases result in broken production builds and config drift. Build an automated GitHub Actions pipeline that lints, tests, builds Docker images, and deploys.",
        whatYouBuild:
          "A production-grade CI/CD pipeline automating code quality checks, container builds, security scans, and deployment workflows.",
        features: [
          "Automated linting and unit test execution on pull requests",
          "Docker container build and vulnerability security scanning",
          "Automated semantic versioning and release notes generation",
          "Staging deployment trigger with automated rollback on failure",
          "Pipeline status badges and Slack/email notification webhooks",
        ],
        buildSteps: [
          "Phase 1: Test Suite Setup — Configure automated unit and integration tests with coverage reports.",
          "Phase 2: GitHub Actions CI — Build workflow for code linting, test runs, and coverage checks.",
          "Phase 3: Container Publishing — Add automated Docker Hub / GitHub Registry image publish step.",
          "Phase 4: Staging Deploy — Build deployment step with environment secret injection.",
          "Phase 5: Verification — Test PR validation triggers and branch protection rules.",
        ],
      },
      {
        id: "devops-serverless",
        icon: "⚡",
        title: "Serverless Media Processing Pipeline",
        problem:
          "Image and file processing overloads application servers. Build an event-driven serverless pipeline to asynchronously optimize and thumbnail media uploads.",
        whatYouBuild:
          "An event-driven serverless media processing pipeline that resizes images, extracts metadata, and generates CDN-ready assets.",
        features: [
          "Event-triggered execution on cloud storage file upload",
          "High-performance image resizing and WebP optimization using Sharp",
          "Metadata extraction and database catalog synchronization",
          "Signed URL generation for secure, time-limited media delivery",
          "Dead-letter queue handling for corrupted file uploads",
        ],
        buildSteps: [
          "Phase 1: Function Architecture — Scaffold serverless function with cloud storage triggers.",
          "Phase 2: Processing Engine — Implement image optimization and thumbnail generation.",
          "Phase 3: Database Sync — Update media records with generated URLs and dimension specs.",
          "Phase 4: Error Handling — Add dead-letter queue for unsupported file formats.",
          "Phase 5: Security & Testing — Verify presigned upload URLs and measure execution latency.",
        ],
      },
      {
        id: "devops-monitor",
        icon: "📊",
        title: "Infrastructure & Telemetry Monitor",
        problem:
          "Developers struggle to detect memory leaks and CPU spikes before outages occur. Build a lightweight telemetry agent and dashboard to monitor service health.",
        whatYouBuild:
          "A server telemetry monitoring agent collecting CPU, memory, event-loop lag, and HTTP latency metrics with alert thresholds.",
        features: [
          "Background metrics collector measuring process CPU, RAM, and event-loop latency",
          "Prometheus-standard `/metrics` scrape endpoint",
          "Real-time health status dashboard showing system performance gauges",
          "Configurable threshold alert triggers for memory leaks and latency spikes",
          "Incident logging and historical uptime reporting",
        ],
        buildSteps: [
          "Phase 1: Metric Collection — Write telemetry collector sampling system and process stats.",
          "Phase 2: Metrics Endpoint — Expose structured Prometheus-compatible scrape route.",
          "Phase 3: Dashboard Interface — Build visual dashboard displaying real-time metric gauges.",
          "Phase 4: Alerting Logic — Implement threshold rules alerting on consecutive high readings.",
          "Phase 5: Verification — Simulate CPU/memory load to verify alert trigger accuracy.",
        ],
      },
    ];
  }

  // 5. Default: REST API / Backend / Full-Stack Service (Matches the user's primary prompt scenario)
  return [
    {
      id: "backend-orders",
      icon: "🛒",
      title: "Small Business Order Management",
      problem:
        "Small businesses often manage customer orders using spreadsheets, making it difficult to track order status, inventory, and customer information. Build an API to manage products, customers, and orders.",
      whatYouBuild:
        "A secure REST API for managing product catalogs, inventory levels, customer profiles, and order processing workflows.",
      features: [
        "Product catalog CRUD with category filtering and stock tracking",
        "Customer profile management and order history lookups",
        "Order lifecycle state machine (Created, Confirmed, Shipped, Delivered, Cancelled)",
        "JWT-based authentication and role-based access for staff vs customers",
        "Input validation and automated OpenAPI/Swagger documentation",
      ],
      buildSteps: [
        "Phase 1: Setup Express — Initialize project structure, database connection, and environment config.",
        "Phase 2: Design Schemas — Model Products, Customers, Orders, and Inventory in MongoDB/SQL.",
        "Phase 3: Implement Auth — Add JWT authentication and role authorization middleware.",
        "Phase 4: Build Order APIs — Implement full CRUD endpoints with pagination, filtering, and stock updates.",
        "Phase 5: Validation & Docs — Add request validation and generate interactive Swagger documentation.",
      ],
    },
    {
      id: "backend-clinic",
      icon: "🏥",
      title: "Clinic Appointment Management",
      problem:
        "Small clinics need a simple system to manage patients, doctors, and appointments. Build an API that allows staff to schedule appointments, update appointment status, and manage appointment records.",
      whatYouBuild:
        "A clinic scheduling API for managing patient records, doctor availability calendars, and conflict-free appointment bookings.",
      features: [
        "Doctor specialty and availability slot management",
        "Patient registration and visit history record keeping",
        "Appointment booking, rescheduling, and cancellation with double-booking prevention",
        "Status tracking (Scheduled, In-Consultation, Completed, Cancelled)",
        "Role-based access control for clinic receptionists, doctors, and patients",
      ],
      buildSteps: [
        "Phase 1: Project Setup — Configure Express server, database connection, and global error handling.",
        "Phase 2: Doctor & Patient Schemas — Create models for Doctors, Availability Slots, Patients, and Bookings.",
        "Phase 3: Scheduling Logic — Implement conflict-free booking logic preventing overlapping appointments.",
        "Phase 4: Appointment Management APIs — Build endpoints for schedule browsing, booking, and status updates.",
        "Phase 5: Security & Testing — Secure patient records with authentication and test edge cases.",
      ],
    },
    {
      id: "backend-delivery",
      icon: "🚚",
      title: "Delivery Tracking System",
      problem:
        "Local delivery businesses need to track deliveries and their status. Build an API to create delivery orders, assign delivery agents, and track statuses such as pending, dispatched, and delivered.",
      whatYouBuild:
        "A logistics tracking API to manage delivery packages, assign field agents, and track real-time dispatch progress.",
      features: [
        "Delivery order creation with pickup, dropoff, and recipient information",
        "Delivery agent assignment based on zone and availability",
        "Timestamped status transitions (Pending, Dispatched, In-Transit, Delivered)",
        "Public tracking lookup endpoint with security verification",
        "Input validation, pagination, and automated Swagger documentation",
      ],
      buildSteps: [
        "Phase 1: Server Architecture — Set up Express application with MongoDB connection and logging.",
        "Phase 2: Logistics Models — Design schemas for Packages, Delivery Agents, and Status Logs.",
        "Phase 3: Assignment & Tracking Logic — Implement automated agent assignment and status transitions.",
        "Phase 4: RESTful API Endpoints — Build routes for agent dispatch, package tracking, and customer lookups.",
        "Phase 5: Documentation & Deployment — Add Swagger documentation and verify integration.",
      ],
    },
    {
      id: "backend-library",
      icon: "📚",
      title: "Digital Library Management",
      problem:
        "Libraries need an efficient way to manage books, members, borrowing, and returns. Build an API that manages books and members while tracking borrowing and return transactions.",
      whatYouBuild:
        "A library circulation API for managing book inventories, member accounts, borrowing transactions, and overdue tracking.",
      features: [
        "Book catalog management with ISBN, genres, and available copy counters",
        "Member account registration with borrowing limits and active loan tracking",
        "Checkout and checkin transaction processing with automated due-date calculation",
        "Overdue tracking and fine calculation system",
        "Search and filtering by author, category, availability, and title",
      ],
      buildSteps: [
        "Phase 1: Scaffold & Database — Initialize Express server and configure database models.",
        "Phase 2: Catalog Schemas — Model Books, Copies, Members, and Circulation Transactions.",
        "Phase 3: Circulation Core Logic — Build borrow/return endpoints enforcing copy availability limits.",
        "Phase 4: Overdue & Search APIs — Implement automated due-date calculation and multi-criteria search.",
        "Phase 5: Final Hardening — Add rate-limiting, comprehensive error handling, and API documentation.",
      ],
    },
  ];
}

function getProjectDetails(proj) {
  if (!proj) return null;

  const skills = Array.isArray(proj.skills) ? proj.skills : [];

  // Tech stack: support proj.techStack or default to skills list
  // eslint-disable-next-line no-useless-assignment
  let techStack = [];
  if (Array.isArray(proj.techStack) && proj.techStack.length > 0) {
    techStack = proj.techStack;
  } else if (typeof proj.techStack === "string" && proj.techStack.trim()) {
    techStack = proj.techStack.split(",").map((s) => s.trim());
  } else if (skills.length > 0) {
    techStack = skills;
  } else {
    techStack = ["Modern Tech Stack"];
  }

  // Features: support proj.features or generate clean sensible defaults
  const features =
    Array.isArray(proj.features) && proj.features.length > 0
      ? proj.features
      : [
          "Core functional workflow with input validation and error handling",
          "Structured data layer with robust schema modeling and persistence",
          "Clean API endpoints and component hierarchy matching industry standards",
          "Production deployment configuration with testing and documentation",
        ];

  // Development steps: support proj.buildSteps or generate practical milestones
  const buildSteps =
    Array.isArray(proj.buildSteps) && proj.buildSteps.length > 0
      ? proj.buildSteps
      : [
          "Phase 1: Architecture & Setup — Initialize project repository, configure tooling, dependencies, and environment variables.",
          "Phase 2: Schema & Data Flow — Design data models, state architecture, and API endpoint contracts.",
          "Phase 3: Core Implementation — Develop the primary business logic, request validation, and UI or service layer.",
          "Phase 4: Testing & Hardening — Validate edge cases, implement error boundaries, and verify integration.",
          "Phase 5: Documentation & Deployment — Write a comprehensive README with architecture diagrams and deploy live.",
        ];

  // Resume value & interview value
  const resumeValue =
    proj.resumeValue ||
    `Adds verifiable portfolio evidence demonstrating hands-on proficiency in ${skills.join(", ") || "the target tech stack"}.`;

  const interviewValue =
    proj.interviewValue ||
    `Gives you concrete technical discussion points covering architectural decisions, scalability trade-offs, and challenge resolution during technical rounds.`;

  // Safe verified resources: check proj.resources or match skills with OFFICIAL_DOCS
  let resources = [];
  if (Array.isArray(proj.resources) && proj.resources.length > 0) {
    resources = proj.resources;
  } else {
    skills.forEach((skill) => {
      const cleanSkill = skill.toLowerCase().trim();
      if (
        OFFICIAL_DOCS[cleanSkill] &&
        !resources.some((r) => r.url === OFFICIAL_DOCS[cleanSkill].url)
      ) {
        resources.push(OFFICIAL_DOCS[cleanSkill]);
      }
    });
  }

  // Generate 4 domain-tailored real-world problem statements
  const problemStatements = getProblemStatements({ ...proj, techStack });

  return {
    ...proj,
    techStack,
    features,
    buildSteps,
    resumeValue,
    interviewValue,
    resources,
    problemStatements,
  };
}

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Active Tab: "general" | "jobMatch"
  const [activeTab, setActiveTab] = useState("general");

  // ==========================================
  // TAB 1: GENERAL RESUME ANALYZER (EXISTING)
  // ==========================================
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const analyzeResume = async () => {
    setGeneralError("");
    if (!resume) {
      setGeneralError("Please upload a resume file (PDF or DOCX).");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", resume);

      const res = await api.post("/resume/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAnalysis(res.data);
    } catch (err) {
      console.error("General resume analysis failed:", err);
      const msg =
        err.response?.data?.message ||
        "Resume analysis failed. Please verify your file and try again.";
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetGeneral = () => {
    setAnalysis(null);
    setGeneralError("");
  };

  const handleSwitchToJobMatch = () => {
    setActiveTab("jobMatch");
    if (resume && !jobResume) {
      setJobResume(resume);
    }
  };

  // ==========================================
  // TAB 2: JOB MATCH ANALYSIS (NEW)
  // ==========================================
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobResume, setJobResume] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState("");
  const [jobAnalysis, setJobAnalysis] = useState(null);

  // Selected project for Project Guide modal
  const [selectedProject, setSelectedProject] = useState(null);

  // Selected real-world problem statement within the Project Guide modal
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleJobMatchAnalyze = async (e) => {
    if (e) e.preventDefault();
    setJobError("");

    if (!jobRole.trim()) {
      setJobError("Please enter a Target Job Role.");
      return;
    }

    if (!jobDescription.trim()) {
      setJobError("Please enter the Job Description.");
      return;
    }

    if (!jobResume) {
      setJobError("Please upload a resume file (PDF or DOCX).");
      return;
    }

    try {
      setJobLoading(true);

      const formData = new FormData();
      formData.append("role", jobRole.trim());
      formData.append("description", jobDescription.trim());
      formData.append("resume", jobResume);

      // Axios handles multipart/form-data boundary automatically
      const res = await api.post("/job-readiness/analyze", formData);

      setJobAnalysis(res.data);
    } catch (err) {
      console.error("Job match analysis error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to analyze job readiness. Please try again.";
      setJobError(msg);
    } finally {
      setJobLoading(false);
    }
  };

  const handleResetJobMatch = () => {
    setJobAnalysis(null);
    setJobError("");
    setSelectedProject(null);
    setSelectedProblem(null);
  };

  const handleOpenProjectGuide = (proj) => {
    setSelectedProject(proj);
    setSelectedProblem(null); // Reset problem selection when opening a project guide
  };

  const handleCloseProjectGuide = () => {
    setSelectedProject(null);
    setSelectedProblem(null);
  };

  const handleStartMockInterview = () => {
    navigate("/mock-interview", {
      state: {
        role: jobRole,
        description: jobDescription,
      },
    });
  };

  const handleViewLearning = () => {
    navigate("/learning");
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Topbar user={user} />

        <h1>AI Resume Analyzer</h1>

        {/* TAB TOGGLE */}
        <div className="analyzer-tabs">
          <button
            type="button"
            className={`analyzer-tab-btn ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            📄 General Analysis
          </button>
          <button
            type="button"
            className={`analyzer-tab-btn ${activeTab === "jobMatch" ? "active" : ""}`}
            onClick={() => setActiveTab("jobMatch")}
          >
            🎯 Job Match Analysis
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1 CONTENT: GENERAL RESUME HEALTH REPORT          */}
        {/* ==================================================== */}
        {activeTab === "general" && (
          <div>
            <p className="subtitle">
              Comprehensive evaluation of your resume's overall quality, ATS readiness, and completeness.
            </p>

            {/* UPLOAD FORM (Shown when no analysis result is present) */}
            {!analysis && (
              <div className="resume-card">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                  disabled={loading}
                />

                {resume && <p className="file-name">📎 {resume.name}</p>}

                {generalError && (
                  <div className="job-error-banner" style={{ marginBottom: "14px" }}>
                    ⚠️ {generalError}
                  </div>
                )}

                <button
                  className="analyze-btn"
                  onClick={analyzeResume}
                  disabled={loading}
                >
                  {loading
                    ? "🤖 AI is auditing your resume..."
                    : "📄 Run Resume Health Audit"}
                </button>
              </div>
            )}

            {/* HEALTH REPORT RESULT (Shown when analysis is ready) */}
            {analysis && (
              <div className="job-result-container">
                {/* TOP ACTION BAR */}
                <div className="result-top-actions">
                  <button className="reset-btn" onClick={handleResetGeneral}>
                    🔄 Analyze Another Resume
                  </button>
                </div>

                {/* 1. ATS SCORE (VISUAL FOCUS) */}
                <div className="job-header-card">
                  <div className="job-header-top">
                    <span className="job-target-badge">📄 General Resume Audit</span>
                  </div>

                  <div className="job-header-main">
                    <div className="job-header-title-box">
                      <span className="job-score-subhead">APPLICANT TRACKING SYSTEM READINESS</span>
                      <h2 className="job-score-title">ATS SCORE</h2>
                      <p className="job-match-disclaimer">
                        Evaluates overall document parsing, section layout, keywords, and technical evidence.
                      </p>
                    </div>

                    <div className="job-score-block">
                      <div className="job-score-display">
                        <span className="job-score-number">{analysis.atsScore}</span>
                        <span className="job-score-denom">/100</span>
                      </div>
                      <span
                        className={`readiness-badge ${
                          analysis.atsScore >= 80
                            ? "readiness-strong"
                            : analysis.atsScore >= 65
                              ? "readiness-good"
                              : analysis.atsScore >= 50
                                ? "readiness-partial"
                                : "readiness-gap"
                        }`}
                      >
                        {analysis.readinessLevel ||
                          (analysis.atsScore >= 80
                            ? "ATS Ready"
                            : analysis.atsScore >= 65
                              ? "Good Quality"
                              : analysis.atsScore >= 50
                                ? "Needs Optimization"
                                : "Needs Rework")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. SUMMARY */}
                {analysis.summary && (
                  <div className="section-card">
                    <h3>📝 Summary</h3>
                    <p className="summary-text">{analysis.summary}</p>
                  </div>
                )}

                {/* 3. RESUME QUALITY BREAKDOWN */}
                {analysis.breakdown && (
                  <div className="section-card">
                    <h3>📊 Resume Quality Breakdown</h3>
                    <div className="breakdown-grid general-breakdown-grid">
                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>ATS Compatibility</span>
                          <strong>{analysis.breakdown.atsCompatibility ?? 80}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${analysis.breakdown.atsCompatibility ?? 80}%` }}
                          />
                        </div>
                      </div>

                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Content Quality</span>
                          <strong>{analysis.breakdown.contentQuality ?? 80}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${analysis.breakdown.contentQuality ?? 80}%` }}
                          />
                        </div>
                      </div>

                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Skills Relevance</span>
                          <strong>{analysis.breakdown.skillsRelevance ?? 80}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${analysis.breakdown.skillsRelevance ?? 80}%` }}
                          />
                        </div>
                      </div>

                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Project Strength</span>
                          <strong>{analysis.breakdown.projectStrength ?? 80}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${analysis.breakdown.projectStrength ?? 80}%` }}
                          />
                        </div>
                      </div>

                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Resume Completeness</span>
                          <strong>{analysis.breakdown.resumeCompleteness ?? 80}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${analysis.breakdown.resumeCompleteness ?? 80}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. RESUME STRENGTHS */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="section-card">
                    <h3>✅ Resume Strengths</h3>
                    <div className="strengths-grid">
                      {analysis.strengths.map((item, idx) => (
                        <div className="strength-card" key={idx}>
                          <div className="strength-title">
                            <span className="strength-icon">✓</span>
                            <strong>Strength {idx + 1}</strong>
                          </div>
                          <p className="strength-reason">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. AREAS TO IMPROVE */}
                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <div className="section-card">
                    <h3>⚠️ Areas to Improve</h3>
                    <div className="areas-improve-grid">
                      {analysis.weaknesses.map((item, idx) => (
                        <div className="area-improve-card" key={idx}>
                          <div className="area-improve-title">
                            <span className="area-improve-icon">⚠</span>
                            <strong>Item {idx + 1}</strong>
                          </div>
                          <p className="area-improve-text">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. SKILLS DETECTED */}
                {analysis.skillsDetected && (
                  <div className="section-card">
                    <h3>🔍 Skills Detected</h3>
                    {typeof analysis.skillsDetected === "object" && !Array.isArray(analysis.skillsDetected) ? (
                      <div className="skills-categorized-container">
                        {Object.entries(analysis.skillsDetected).map(([cat, skills]) => {
                          if (!Array.isArray(skills) || skills.length === 0) return null;
                          return (
                            <div key={cat} className="skill-category-group">
                              <span className="skill-category-label">
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}:
                              </span>
                              <div className="skills-chips-row">
                                {skills.map((skill, sIdx) => (
                                  <span className="skill-chip general-skill-chip" key={sIdx}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : Array.isArray(analysis.skillsDetected) && analysis.skillsDetected.length > 0 ? (
                      <div className="skills-chips-row">
                        {analysis.skillsDetected.map((skill, sIdx) => (
                          <span className="skill-chip general-skill-chip" key={sIdx}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-feedback">No explicit technical skills extracted.</p>
                    )}
                  </div>
                )}

                {/* 7. RESUME SECTION ANALYSIS */}
                {analysis.resumeSections && (
                  <div className="section-card">
                    <h3>📑 Resume Sections</h3>
                    <div className="resume-sections-grid">
                      {[
                        { key: "education", label: "Education" },
                        { key: "technicalSkills", label: "Technical Skills" },
                        { key: "projects", label: "Projects" },
                        { key: "experience", label: "Work Experience" },
                        { key: "achievements", label: "Achievements" },
                        { key: "certifications", label: "Certifications" },
                      ].map((sec) => {
                        const isPresent = Boolean(analysis.resumeSections[sec.key]);
                        return (
                          <div
                            key={sec.key}
                            className={`resume-section-item ${
                              isPresent ? "sec-present" : "sec-missing"
                            }`}
                          >
                            <span className="sec-icon">{isPresent ? "✓" : "⚠"}</span>
                            <span className="sec-name">{sec.label}</span>
                            <span className={`sec-status-badge ${isPresent ? "detected" : "not-detected"}`}>
                              {isPresent ? "Detected" : "Not Detected"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 8. ATS & KEYWORD ANALYSIS */}
                {analysis.atsAnalysis && (
                  <div className="section-card">
                    <h3>⚡ ATS & Keyword Analysis</h3>
                    <div className="feedback-three-cols ats-analysis-grid">
                      {/* Positive ATS Observations */}
                      <div className="feedback-col strengths-col">
                        <h4>✓ Positive ATS Observations</h4>
                        {analysis.atsAnalysis.positive && analysis.atsAnalysis.positive.length > 0 ? (
                          <ul>
                            {analysis.atsAnalysis.positive.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="empty-feedback">Standard layout observed.</p>
                        )}
                      </div>

                      {/* Potential ATS Issues */}
                      <div className="feedback-col weaknesses-col">
                        <h4>⚠ Potential ATS Issues</h4>
                        {analysis.atsAnalysis.issues && analysis.atsAnalysis.issues.length > 0 ? (
                          <ul>
                            {analysis.atsAnalysis.issues.map((iss, idx) => (
                              <li key={idx}>{iss}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="empty-feedback">No critical ATS parsing blockers identified.</p>
                        )}
                      </div>

                      {/* Keywords Present */}
                      <div className="feedback-col keywords-col">
                        <h4>🏷️ Technical Keywords Found</h4>
                        {analysis.atsAnalysis.keywordsPresent &&
                        analysis.atsAnalysis.keywordsPresent.length > 0 ? (
                          <div className="skills-chips-row" style={{ marginTop: "6px" }}>
                            {analysis.atsAnalysis.keywordsPresent.map((kw, idx) => (
                              <span className="skill-chip general-keyword-chip" key={idx}>
                                {kw}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="empty-feedback">No key developer terms extracted.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. RESUME IMPROVEMENTS */}
                {analysis.improvements && analysis.improvements.length > 0 && (
                  <div className="section-card">
                    <h3>💡 Resume Improvements</h3>
                    <div className="next-steps-container">
                      {analysis.improvements.map((imp, idx) => (
                        <div className="next-step-row" key={idx}>
                          <span className="step-badge">{idx + 1}</span>
                          <span className="step-text">{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. RECOMMENDED NEXT STEPS */}
                {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                  <div className="section-card">
                    <h3>🚀 Recommended Next Steps</h3>
                    <div className="next-steps-container">
                      {analysis.nextSteps.map((step, idx) => (
                        <div className="next-step-row" key={idx}>
                          <span className="step-badge" style={{ background: "#4f46e5" }}>
                            {idx + 1}
                          </span>
                          <span className="step-text">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11. JOB MATCH CTA */}
                <div className="section-card mock-cta-card">
                  <div>
                    <span className="mock-cta-badge">🎯 Target Job Alignment</span>
                    <h3>Want to know how well your resume fits a specific job?</h3>
                    <p className="mock-cta-reason">
                      Compare your resume against a target role and job description to get a job match score, skill gap breakdown, and tailored interview prep.
                    </p>
                    <button
                      type="button"
                      className="mock-start-btn"
                      onClick={handleSwitchToJobMatch}
                    >
                      🎯 Analyze Against a Job →
                    </button>
                  </div>
                </div>

                {/* BOTTOM RESET BUTTON */}
                <div className="result-bottom-actions">
                  <button className="reset-btn" onClick={handleResetGeneral}>
                    🔄 Analyze Another Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2 CONTENT: JOB MATCH ANALYSIS                    */}
        {/* ==================================================== */}
        {activeTab === "jobMatch" && (
          <div>
            <p className="subtitle">
              Analyze how ready you are for a specific job based on your resume and
              the job requirements.
            </p>

            {/* FORM CARD (shown when no result is present) */}
            {!jobAnalysis && (
              <div className="resume-card job-form-card">
                <div className="form-group">
                  <label className="field-label">
                    Target Job Role <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Software Engineer Intern, Frontend Developer, Backend Engineer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    disabled={jobLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">
                    Job Description <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder="Paste the target job description, responsibilities, and required qualifications here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={jobLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">
                    Upload Resume (PDF, DOCX) <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setJobResume(e.target.files[0])}
                    disabled={jobLoading}
                  />
                  {jobResume && <p className="file-name">📎 {jobResume.name}</p>}
                </div>

                {jobError && (
                  <div className="job-error-banner">
                    ⚠️ {jobError}
                  </div>
                )}

                <button
                  className="analyze-btn"
                  onClick={handleJobMatchAnalyze}
                  disabled={jobLoading}
                >
                  {jobLoading
                    ? "🤖 Analyzing your resume against the job description..."
                    : "🎯 Analyze Job Readiness"}
                </button>
              </div>
            )}

            {/* RESULT REPORT (shown when analysis is ready) */}
            {jobAnalysis && (
              <div className="job-result-container">
                {/* TOP ACTION BAR */}
                <div className="result-top-actions">
                  <button className="reset-btn" onClick={handleResetJobMatch}>
                    🔄 Analyze Another Job
                  </button>
                </div>

                {/* 1. OVERALL SCORE CARD (COMPACT VISUAL FOCUS) */}
                <div className="job-header-card">
                  <div className="job-header-top">
                    <span className="job-target-badge">🎯 Target Role: {jobRole}</span>
                  </div>

                  <div className="job-header-main">
                    <div className="job-header-title-box">
                      <span className="job-score-subhead">CAREER READINESS ASSESSMENT</span>
                      <h2 className="job-score-title">JOB READINESS</h2>
                      <p className="job-match-disclaimer">
                        Represents alignment between your resume evidence and this job description.
                      </p>
                    </div>

                    <div className="job-score-block">
                      <div className="job-score-display">
                        <span className="job-score-number">{jobAnalysis.jobMatchScore}</span>
                        <span className="job-score-denom">/100</span>
                      </div>
                      <span
                        className={`readiness-badge ${
                          jobAnalysis.jobMatchScore >= 80
                            ? "readiness-strong"
                            : jobAnalysis.jobMatchScore >= 65
                              ? "readiness-good"
                              : jobAnalysis.jobMatchScore >= 50
                                ? "readiness-partial"
                                : "readiness-gap"
                        }`}
                      >
                        {jobAnalysis.readinessLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. SUMMARY */}
                <div className="section-card">
                  <h3>📝 Summary</h3>
                  <p className="summary-text">{jobAnalysis.summary}</p>
                </div>

                {/* 3. READINESS BREAKDOWN (COMPACT ONE ROW ON DESKTOP) */}
                {jobAnalysis.breakdown && (
                  <div className="section-card">
                    <h3>📊 Readiness Breakdown</h3>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Skills Match</span>
                          <strong>{jobAnalysis.breakdown.skillsMatch}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${jobAnalysis.breakdown.skillsMatch}%` }}
                          />
                        </div>
                      </div>

                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Technical Experience</span>
                          <strong>{jobAnalysis.breakdown.technicalExperience}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${jobAnalysis.breakdown.technicalExperience}%` }}
                          />
                        </div>
                      </div>

                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Projects</span>
                          <strong>{jobAnalysis.breakdown.projects}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${jobAnalysis.breakdown.projects}%` }}
                          />
                        </div>
                      </div>

                      <div className="breakdown-item">
                        <div className="breakdown-info">
                          <span>Resume Alignment</span>
                          <strong>{jobAnalysis.breakdown.resumeAlignment}%</strong>
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{ width: `${jobAnalysis.breakdown.resumeAlignment}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CANDIDATE STRENGTHS (COMPACT 3 COLS DESKTOP) */}
                {jobAnalysis.strengths && jobAnalysis.strengths.length > 0 && (
                  <div className="section-card">
                    <h3>✅ Candidate Strengths</h3>
                    <div className="strengths-grid">
                      {jobAnalysis.strengths.map((item, idx) => (
                        <div className="strength-card" key={idx}>
                          <div className="strength-title">
                            <span className="strength-icon">✨</span>
                            <strong>{item.skill}</strong>
                          </div>
                          <p className="strength-reason">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. SKILL ANALYSIS (COMPACT HORIZONTAL ROWS) */}
                {jobAnalysis.skillAnalysis && jobAnalysis.skillAnalysis.length > 0 && (
                  <div className="section-card">
                    <h3>🔍 Skill Analysis</h3>
                    <div className="skill-table">
                      {jobAnalysis.skillAnalysis.map((item, idx) => {
                        const statusLower = item.status?.toLowerCase();
                        const isMissingOrPartial = statusLower === "missing" || statusLower === "partial";
                        const statusClass =
                          statusLower === "strong"
                            ? "skill-strong"
                            : statusLower === "partial"
                              ? "skill-partial"
                              : "skill-missing";

                        return (
                          <div className="skill-compact-row" key={idx}>
                            <div className="skill-compact-header">
                              <span className="skill-name">{item.skill}</span>
                              <span className={`skill-status-tag ${statusClass}`}>
                                {item.status}
                              </span>
                              {item.importance && (
                                <span className="importance-tag">
                                  {item.importance} Importance
                                </span>
                              )}
                              {isMissingOrPartial && (
                                <button
                                  type="button"
                                  className="view-lg-btn"
                                  style={{
                                    marginLeft: "auto",
                                    padding: "4px 10px",
                                    fontSize: "12px",
                                    background: "#4f46e5",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                  }}
                                  onClick={() => {
                                    const roleQuery = jobRole ? `&role=${encodeURIComponent(jobRole)}` : "";
                                    navigate(`/learning-guide?skill=${encodeURIComponent(item.skill)}${roleQuery}`);
                                  }}
                                >
                                  View Learning Guide
                                </button>
                              )}
                            </div>
                            <p className="skill-reason-text">{item.reason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. SKILL GAPS (COMPACT GRID) */}
                {jobAnalysis.skillGaps && jobAnalysis.skillGaps.length > 0 && (
                  <div className="section-card">
                    <h3>⚠️ Skill Gaps</h3>
                    <div className="gaps-grid">
                      {jobAnalysis.skillGaps.map((item, idx) => {
                        const priorityClass =
                          item.priority?.toLowerCase() === "high"
                            ? "priority-high"
                            : item.priority?.toLowerCase() === "medium"
                              ? "priority-medium"
                              : "priority-low";

                        return (
                          <div className="gap-compact-card" key={idx}>
                            <div className="gap-compact-header">
                              <strong className="gap-skill">{item.skill}</strong>
                              <span className={`priority-tag ${priorityClass}`}>
                                {item.priority || "Medium"} Priority
                              </span>
                            </div>
                            <p className="gap-reason-text">{item.reason}</p>
                            <button
                              type="button"
                              style={{
                                marginTop: "8px",
                                padding: "4px 10px",
                                fontSize: "12px",
                                background: "#4f46e5",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                              onClick={() => {
                                const roleQuery = jobRole ? `&role=${encodeURIComponent(jobRole)}` : "";
                                navigate(`/learning-guide?skill=${encodeURIComponent(item.skill)}${roleQuery}`);
                              }}
                            >
                              View Learning Guide
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. RECOMMENDED LEARNING FOR SKILL GAPS */}
                {jobAnalysis.learningRecommendations &&
                  jobAnalysis.learningRecommendations.length > 0 && (
                    <div className="section-card">
                      <h3>📚 Recommended Learning for Your Skill Gaps</h3>
                      <div className="learning-grid">
                        {jobAnalysis.learningRecommendations.map((item, idx) => (
                          <div className="learning-item-card" key={idx}>
                            <div className="learning-item-header">
                              <h4>{item.topic || item.skill}</h4>
                              {item.matchedFromDatabase && (
                                <span className="db-badge">🗄️ Database Verified</span>
                              )}
                            </div>

                            <div className="learning-meta">
                              {item.difficulty && (
                                <span className="learning-difficulty">
                                  🎯 {item.difficulty}
                                </span>
                              )}
                              {item.duration && (
                                <span className="learning-duration">
                                  ⏳ {item.duration}
                                </span>
                              )}
                              {item.priority && (
                                <span
                                  className={`priority-tag ${
                                    item.priority?.toLowerCase() === "high"
                                      ? "priority-high"
                                      : item.priority?.toLowerCase() === "medium"
                                        ? "priority-medium"
                                        : "priority-low"
                                  }`}
                                >
                                  {item.priority} Priority
                                </span>
                              )}
                            </div>

                            <p className="learning-desc">{item.description}</p>

                            {item.reason && (
                              <div className="learning-reason-box">
                                <strong>💡 Why learn this:</strong> {item.reason}
                              </div>
                            )}

                            {item.resources && item.resources.length > 0 && (
                              <div className="learning-resources-list">
                                <strong>Resources:</strong>
                                <ul>
                                  {item.resources.map((res, rIdx) => (
                                    <li key={rIdx}>
                                      <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="resource-anchor"
                                      >
                                        🔗 {res.name} ↗
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 8. RECOMMENDED RESOURCES (ONLY IF NON-EMPTY) */}
                {jobAnalysis.recommendedResources &&
                  jobAnalysis.recommendedResources.length > 0 && (
                    <div className="section-card">
                      <h3>🔗 Recommended Resources</h3>
                      <div className="resources-pill-grid">
                        {jobAnalysis.recommendedResources.map((res, idx) => (
                          <a
                            key={idx}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="resource-pill"
                          >
                            🌐 {res.name} <span className="arrow-icon">↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 9. RECOMMENDED PROJECTS (ACTIONABLE WITH GUIDE) */}
                {jobAnalysis.projectRecommendations &&
                  jobAnalysis.projectRecommendations.length > 0 && (
                    <div className="section-card">
                      <h3>🛠️ Recommended Projects</h3>
                      <div className="projects-action-grid">
                        {jobAnalysis.projectRecommendations.map((rawProj, idx) => {
                          const proj = getProjectDetails(rawProj);

                          return (
                            <div className="project-action-card" key={idx}>
                              <div className="project-card-header">
                                <h4 className="project-title">{proj.title}</h4>
                                <p className="project-desc">{proj.description}</p>
                              </div>

                              <div className="project-meta-rows">
                                <div className="project-meta-row">
                                  <span className="project-meta-label">Suggested Tech Stack:</span>
                                  <span className="project-meta-tech">
                                    {proj.techStack.join(" · ")}
                                  </span>
                                </div>

                                <div className="project-meta-row">
                                  <span className="project-meta-label">Skills You'll Demonstrate:</span>
                                  <div className="project-skills-chips">
                                    {proj.skills.map((s, sIdx) => (
                                      <span className="skill-chip" key={sIdx}>
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {proj.reason && (
                                  <div className="project-reason-row">
                                    <span className="project-meta-label">Why This Project?</span>
                                    <p className="project-reason-text">{proj.reason}</p>
                                  </div>
                                )}
                              </div>

                              <div className="project-card-action">
                                <button
                                  type="button"
                                  className="view-guide-btn"
                                  onClick={() => handleOpenProjectGuide(proj)}
                                >
                                  View Project Guide →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* 10. RESUME FEEDBACK (3 BALANCED COLUMNS) */}
                <div className="section-card">
                  <h3>📋 Resume Feedback</h3>
                  <div className="feedback-three-cols">
                    {/* Strengths Column */}
                    <div className="feedback-col strengths-col">
                      <h4>✅ Resume Strengths</h4>
                      {jobAnalysis.resumeStrengths &&
                      jobAnalysis.resumeStrengths.length > 0 ? (
                        <ul>
                          {jobAnalysis.resumeStrengths.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty-feedback">No specific strengths noted.</p>
                      )}
                    </div>

                    {/* Weaknesses Column */}
                    <div className="feedback-col weaknesses-col">
                      <h4>⚠️ Resume Weaknesses</h4>
                      {jobAnalysis.resumeWeaknesses &&
                      jobAnalysis.resumeWeaknesses.length > 0 ? (
                        <ul>
                          {jobAnalysis.resumeWeaknesses.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty-feedback">No major weaknesses identified.</p>
                      )}
                    </div>

                    {/* Improvements Column */}
                    <div className="feedback-col improvements-col">
                      <h4>💡 Resume Improvements</h4>
                      {jobAnalysis.resumeImprovements &&
                      jobAnalysis.resumeImprovements.length > 0 ? (
                        <ul>
                          {jobAnalysis.resumeImprovements.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty-feedback">Profile is well tailored.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 11. NEXT STEPS (COMPACT NUMBERED ROADMAP) */}
                {jobAnalysis.nextSteps && jobAnalysis.nextSteps.length > 0 && (
                  <div className="section-card">
                    <h3>🚀 Next Steps</h3>
                    <div className="next-steps-container">
                      {jobAnalysis.nextSteps.map((step, idx) => (
                        <div className="next-step-row" key={idx}>
                          <span className="step-badge">{idx + 1}</span>
                          <span className="step-text">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 12. AI MOCK INTERVIEW CTA */}
                <div className="section-card mock-cta-card">
                  {jobAnalysis.mockInterview?.recommended ? (
                    <div>
                      <span className="mock-cta-badge">🎯 Interview Ready</span>
                      <h3>You're ready to practice for this role.</h3>
                      <p className="mock-cta-reason">
                        {jobAnalysis.mockInterview?.reason ||
                          "Your profile has a reasonable match for this role. Test your technical readiness with an AI mock interview tailored to this job."}
                      </p>
                      <button
                        className="mock-start-btn"
                        onClick={handleStartMockInterview}
                      >
                        🚀 Start AI Mock Interview
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="mock-cta-badge warning">💡 Skill Gaps Identified</span>
                      <h3>Focus on your skill gaps before attempting the interview.</h3>
                      <p className="mock-cta-reason">
                        {jobAnalysis.mockInterview?.reason ||
                          "We recommend addressing key skill gaps and building project evidence before interviewing to maximize your chances."}
                      </p>
                      <div className="mock-cta-btn-group">
                        <button
                          className="mock-start-btn"
                          onClick={handleViewLearning}
                        >
                          📚 View Learning Plan
                        </button>
                        <button
                          className="mock-secondary-btn"
                          onClick={handleStartMockInterview}
                        >
                          Practice Interview Anyway →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM RESET BUTTON */}
                <div className="result-bottom-actions">
                  <button className="reset-btn" onClick={handleResetJobMatch}>
                    🔄 Analyze Another Job
                  </button>
                </div>

                {/* ==================================================== */}
                {/* PROJECT IMPLEMENTATION GUIDE MODAL                   */}
                {/* ==================================================== */}
                {selectedProject && (
                  <div
                    className="modal-overlay"
                    onClick={handleCloseProjectGuide}
                  >
                    <div
                      className="project-guide-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="modal-header">
                        <div>
                          <span className="modal-badge">
                            🛠️ Project Implementation Guide
                          </span>
                          <h2>{selectedProject.title}</h2>
                        </div>
                        <button
                          className="modal-close-btn"
                          onClick={handleCloseProjectGuide}
                          aria-label="Close Guide"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="modal-body">
                        {/* 🎯 SECTION: CHOOSE A REAL-WORLD PROBLEM (EXACTLY 4 CHOICES) */}
                        <div className="modal-section real-world-picker-section">
                          <div className="picker-heading-row">
                            <h4>🎯 Choose a Real-World Problem</h4>
                            <span className="picker-hint">
                              Select a specific scenario to tailor your implementation guide
                            </span>
                          </div>

                          <div className="problems-selection-grid">
                            {(selectedProject.problemStatements || []).map((problem) => {
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

                                  <div className="problem-card-footer">
                                    <button
                                      type="button"
                                      className={`problem-choose-btn ${
                                        isSelected ? "chosen" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProblem(
                                          isSelected ? null : problem
                                        );
                                      }}
                                    >
                                      {isSelected ? "✓ Selected" : "Choose"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Selected Problem Notification Banner */}
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

                        {/* Objective & What to Build (Adapts to selected problem) */}
                        <div className="modal-section">
                          <h4>
                            {selectedProblem ? "💡 What You'll Build" : "🎯 Objective & What to Build"}
                          </h4>
                          <p>
                            {selectedProblem
                              ? selectedProblem.whatYouBuild
                              : selectedProject.description}
                          </p>
                        </div>

                        {/* Suggested Tech Stack */}
                        <div className="modal-section">
                          <h4>💻 Suggested Tech Stack</h4>
                          <div className="modal-tech-stack">
                            {selectedProject.techStack.map((tech, i) => (
                              <span className="tech-badge" key={i}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Core Features (Adapts to selected problem) */}
                        <div className="modal-section">
                          <h4>⚡ Core Features</h4>
                          <ul className="modal-feature-list">
                            {(selectedProblem
                              ? selectedProblem.features
                              : selectedProject.features
                            ).map((feat, i) => (
                              <li key={i}>{feat}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Suggested Development Steps (Adapts to selected problem) */}
                        <div className="modal-section">
                          <h4>📋 Suggested Development Steps</h4>
                          <div className="modal-steps-list">
                            {(selectedProblem
                              ? selectedProblem.buildSteps
                              : selectedProject.buildSteps
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
                            {selectedProject.skills.map((skill, i) => (
                              <span className="modal-skill-pill" key={i}>
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Resume & Interview Value */}
                        <div className="modal-section-grid">
                          <div className="modal-callout resume-callout">
                            <h5>📄 Resume Value</h5>
                            <p>
                              {selectedProblem
                                ? `Proves practical competence in ${selectedProject.techStack.join(", ")} by demonstrating an end-to-end solution for ${selectedProblem.title}.`
                                : selectedProject.resumeValue}
                            </p>
                          </div>
                          <div className="modal-callout interview-callout">
                            <h5>💼 Interview Value</h5>
                            <p>
                              {selectedProblem
                                ? `Gives you concrete architectural scenarios to explain in technical interviews: database schemas, API lifecycle handling, and trade-offs for ${selectedProblem.title}.`
                                : selectedProject.interviewValue}
                            </p>
                          </div>
                        </div>

                        {/* Technical Resources */}
                        <div className="modal-section">
                          <h4>📚 Verified Technical Documentation</h4>
                          {selectedProject.resources &&
                          selectedProject.resources.length > 0 ? (
                            <div className="modal-resource-links">
                              {selectedProject.resources.map((res, i) => (
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
                            <a
                              href="https://developer.mozilla.org"
                              target="_blank"
                              rel="noreferrer"
                              className="modal-doc-link"
                            >
                              🌐 Explore Official Documentation ↗
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button
                          className="modal-done-btn"
                          onClick={handleCloseProjectGuide}
                        >
                          Close Project Guide
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
