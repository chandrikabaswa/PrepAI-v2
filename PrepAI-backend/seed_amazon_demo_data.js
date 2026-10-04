const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

dotenv.config();

// 1. Amazon 15 Internship Specifications
const amazonInternshipsData = [
  {
    title: "Software Development Intern (SDE)",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    stipend: "₹90,000/month",
    duration: "6 Months",
    skills: ["Java", "C++", "Data Structures", "Algorithms", "Object-Oriented Programming", "System Design"],
    applyLink: "https://amazon.jobs/en/jobs/internships/sde",
    description: "Join Amazon Core Engineering team as an SDE Intern. You will design, build, and optimize scalable distributed services handling millions of daily customer requests.",
    status: "Active"
  },
  {
    title: "Frontend Development Intern",
    location: "Hyderabad, Telangana",
    mode: "Remote",
    stipend: "₹80,000/month",
    duration: "6 Months",
    skills: ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Redux", "REST APIs"],
    applyLink: "https://amazon.jobs/en/jobs/internships/frontend",
    description: "Build ultra-responsive, accessible, and high-performance customer-facing web components for Amazon Retail and Prime Web Experience.",
    status: "Active"
  },
  {
    title: "Backend Development Intern",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    stipend: "₹85,000/month",
    duration: "6 Months",
    skills: ["Java", "Spring Boot", "Node.js", "AWS", "Microservices", "REST APIs", "SQL"],
    applyLink: "https://amazon.jobs/en/jobs/internships/backend",
    description: "Develop resilient backend microservices, event-driven pipelines, and relational/NoSQL datastores powering Amazon Payment and Fulfillment services.",
    status: "Active"
  },
  {
    title: "Full Stack Development Intern",
    location: "Hyderabad, Telangana",
    mode: "Onsite",
    stipend: "₹85,000/month",
    duration: "6 Months",
    skills: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript", "AWS Cloud", "Git"],
    applyLink: "https://amazon.jobs/en/jobs/internships/fullstack",
    description: "Work across the entire stack—from modern React single-page apps to cloud-native Node.js microservices powering Seller Central tools.",
    status: "Active"
  },
  {
    title: "Data Engineering Intern",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    stipend: "₹88,000/month",
    duration: "6 Months",
    skills: ["Python", "PySpark", "SQL", "AWS Redshift", "ETL Pipelines", "Hadoop", "Data Warehousing"],
    applyLink: "https://amazon.jobs/en/jobs/internships/data-engineer",
    description: "Architect big data pipelines, aggregate real-time telemetry, and maintain data warehouse clusters supporting global logistics analytics.",
    status: "Active"
  },
  {
    title: "Machine Learning Intern",
    location: "Bengaluru, Karnataka",
    mode: "Onsite",
    stipend: "₹95,000/month",
    duration: "6 Months",
    skills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Computer Vision", "NLP", "Pandas"],
    applyLink: "https://amazon.jobs/en/jobs/internships/ml",
    description: "Develop statistical models and machine learning pipelines for recommendation engines, search relevance, and automated fraud detection.",
    status: "Active"
  },
  {
    title: "AI/ML Engineering Intern",
    location: "Hyderabad, Telangana",
    mode: "Hybrid",
    stipend: "₹95,000/month",
    duration: "6 Months",
    skills: ["Python", "Generative AI", "LLMs", "LangChain", "PyTorch", "Transformers", "AWS Bedrock"],
    applyLink: "https://amazon.jobs/en/jobs/internships/ai-ml",
    description: "Integrate state-of-the-art Generative AI models and LLM agent frameworks to automate customer support and conversational AI assistants.",
    status: "Active"
  },
  {
    title: "Cloud Engineering Intern",
    location: "Gurugram, Haryana",
    mode: "Remote",
    stipend: "₹80,000/month",
    duration: "3 Months",
    skills: ["AWS", "CloudFormation", "Terraform", "Linux", "Networking", "Python", "Docker"],
    applyLink: "https://amazon.jobs/en/jobs/internships/cloud",
    description: "Assist AWS Cloud Operations in managing automated infrastructure provisionings, security compliance benchmarks, and IAM policies.",
    status: "Active"
  },
  {
    title: "DevOps Intern",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    stipend: "₹82,000/month",
    duration: "6 Months",
    skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Jenkins", "Linux", "Bash Shell"],
    applyLink: "https://amazon.jobs/en/jobs/internships/devops",
    description: "Build robust CI/CD automation deployment pipelines, containerize backend microservices, and configure Kubernetes cluster autoscaling.",
    status: "Active"
  },
  {
    title: "Mobile App Development Intern",
    location: "Chennai, Tamil Nadu",
    mode: "Hybrid",
    stipend: "₹75,000/month",
    duration: "6 Months",
    skills: ["Flutter", "React Native", "Android SDK", "Kotlin", "Swift", "REST APIs"],
    applyLink: "https://amazon.jobs/en/jobs/internships/mobile",
    description: "Create engaging mobile feature workflows and smooth UI experiences for the Amazon Shopping and Prime Video Android/iOS mobile applications.",
    status: "Active"
  },
  {
    title: "QA / Software Testing Intern",
    location: "Pune, Maharashtra",
    mode: "Remote",
    stipend: "₹70,000/month",
    duration: "6 Months",
    skills: ["Selenium", "Java", "Python", "Automated Testing", "JUnit", "Postman", "CI/CD"],
    applyLink: "https://amazon.jobs/en/jobs/internships/qa",
    description: "Design comprehensive automated end-to-end test suites, performance benchmarks, and regression tests for core e-commerce services.",
    status: "Active"
  },
  {
    title: "Data Analyst Intern",
    location: "Hyderabad, Telangana",
    mode: "Hybrid",
    stipend: "₹75,000/month",
    duration: "3 Months",
    skills: ["SQL", "Python", "PowerBI", "Tableau", "Excel", "Data Visualization", "Statistics"],
    applyLink: "https://amazon.jobs/en/jobs/internships/data-analyst",
    description: "Transform complex operational metrics into actionable executive dashboards, trend forecasting models, and supply chain insights.",
    status: "Active"
  },
  {
    title: "Cybersecurity Intern",
    location: "Bengaluru, Karnataka",
    mode: "Onsite",
    stipend: "₹85,000/month",
    duration: "6 Months",
    skills: ["Network Security", "Penetration Testing", "Python", "SIEM", "Cryptography", "Identity Access Management (IAM)"],
    applyLink: "https://amazon.jobs/en/jobs/internships/security",
    description: "Audit cloud infrastructure security, perform vulnerability scans, and implement automated threat prevention controls across Amazon Web Services.",
    status: "Active"
  },
  {
    title: "Solutions Architect Intern",
    location: "Gurugram, Haryana",
    mode: "Hybrid",
    stipend: "₹90,000/month",
    duration: "6 Months",
    skills: ["AWS", "System Architecture", "Cloud Infrastructure", "Distributed Systems", "Networking", "Security"],
    applyLink: "https://amazon.jobs/en/jobs/internships/solutions-architect",
    description: "Partner with enterprise customers to design cost-effective, resilient, and fault-tolerant cloud computing architectures on AWS.",
    status: "Active"
  },
  {
    title: "Business Intelligence Intern",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    stipend: "₹78,000/month",
    duration: "3 Months",
    skills: ["SQL", "AWS QuickSight", "Data Modeling", "ETL", "Python", "Tableau"],
    applyLink: "https://amazon.jobs/en/jobs/internships/bi",
    description: "Engineer data models and interactive QuickSight dashboards analyzing customer purchasing behaviors and fulfillment center throughput.",
    status: "Active"
  }
];

// 2. 50 Student Applicants Specifications (20 Initial + 30 Additional)
const amazonStudentsData = [
  // --- INITIAL 20 STUDENTS ---
  {
    name: "Aarav Sharma",
    email: "aarav.sharma.demo@prepai.edu.in",
    college: "IIT Hyderabad",
    degree: "B.Tech",
    branch: "Computer Science & Engineering",
    year: "4th Year",
    skills: ["Java", "Data Structures", "Algorithms", "C++", "System Design", "SQL"],
    concepts: ["OOP", "DBMS", "Operating Systems", "Computer Networks"],
    goal: "SDE Role at Top Product Tech Company",
    bio: "Final-year Computer Science student passionate about competitive programming, distributed algorithms, and high-performance Java backends.",
    projects: [
      {
        title: "Distributed Key-Value Store",
        description: "Implemented a fault-tolerant in-memory key-value store using Raft consensus algorithm.",
        techStack: ["Java", "gRPC", "Docker"],
        githubUrl: "https://github.com/demo/distributed-kv",
        liveUrl: "https://demo-kv.example.com"
      }
    ],
    codingProfiles: {
      github: "https://github.com/aarav-sharma-demo",
      leetcode: "https://leetcode.com/aarav_demo",
      linkedin: "https://linkedin.com/in/aarav-sharma-demo"
    }
  },
  {
    name: "Ananya Verma",
    email: "ananya.verma.demo@prepai.edu.in",
    college: "BITS Pilani",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Redux", "Node.js"],
    concepts: ["Web Architecture", "REST APIs", "UI/UX Optimization"],
    goal: "Frontend Developer",
    bio: "Enthusiastic web frontend developer specializing in modern React ecosystem, web accessibility, and interactive design components.",
    projects: [
      {
        title: "Collaborative Code Editor",
        description: "Real-time web code editor with live cursor sync powered by WebSockets and Monaco Editor.",
        techStack: ["React", "TypeScript", "WebSocket", "TailwindCSS"],
        githubUrl: "https://github.com/demo/code-editor-web"
      }
    ],
    codingProfiles: {
      github: "https://github.com/ananya-v-demo",
      linkedin: "https://linkedin.com/in/ananya-verma-demo"
    }
  },
  {
    name: "Rohan Kulkarni",
    email: "rohan.kulkarni.demo@prepai.edu.in",
    college: "NIT Surathkal",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "4th Year",
    skills: ["Java", "Spring Boot", "Node.js", "Microservices", "REST APIs", "SQL", "Docker"],
    concepts: ["Microservice Architecture", "Database Sharding", "JWT Authentication"],
    goal: "Backend Engineer",
    bio: "Backend developer focused on robust Spring Boot microservices, high-concurrency message queues, and API gateway integrations.",
    projects: [
      {
        title: "E-Commerce Payment Gateway Gateway",
        description: "Secure, idempotent microservices payment pipeline with automated retry handling.",
        techStack: ["Java", "Spring Boot", "PostgreSQL", "RabbitMQ"],
        githubUrl: "https://github.com/demo/payment-gateway"
      }
    ],
    codingProfiles: {
      github: "https://github.com/rohan-k-demo",
      leetcode: "https://leetcode.com/rohan_demo"
    }
  },
  {
    name: "Priya Patel",
    email: "priya.patel.demo@prepai.edu.in",
    college: "IIT Bombay",
    degree: "M.Tech",
    branch: "Artificial Intelligence",
    year: "2nd Year",
    skills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Computer Vision"],
    concepts: ["Convolutional Neural Networks", "Deep Learning", "Model Quantization"],
    goal: "Machine Learning Engineer",
    bio: "AI researcher working on real-time computer vision models, medical imaging segmentation, and PyTorch model optimization.",
    projects: [
      {
        title: "Autonomous Defect Detection System",
        description: "Real-time industrial manufacturing defect detection using YOLOv8 and PyTorch.",
        techStack: ["Python", "PyTorch", "OpenCV", "Flask"],
        githubUrl: "https://github.com/demo/defect-detection"
      }
    ],
    codingProfiles: {
      github: "https://github.com/priya-patel-demo",
      linkedin: "https://linkedin.com/in/priya-patel-demo"
    }
  },
  {
    name: "Aditya Rao",
    email: "aditya.rao.demo@prepai.edu.in",
    college: "IIIT Hyderabad",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Python", "Generative AI", "LLMs", "LangChain", "PyTorch", "Transformers", "AWS"],
    concepts: ["RAG Pipelines", "Vector Databases", "Prompt Engineering"],
    goal: "AI Engineer",
    bio: "Building intelligent retrieval-augmented generation systems, AI agent tools, and fine-tuned open-source LLM workflows.",
    projects: [
      {
        title: "Enterprise Knowledge Base RAG Assistant",
        description: "Contextual document QA bot using LangChain, ChromaDB, and Groq LLM API.",
        techStack: ["Python", "LangChain", "ChromaDB", "FastAPI"],
        githubUrl: "https://github.com/demo/rag-assistant"
      }
    ],
    codingProfiles: {
      github: "https://github.com/aditya-rao-demo",
      leetcode: "https://leetcode.com/aditya_demo"
    }
  },
  {
    name: "Sneha Gupta",
    email: "sneha.gupta.demo@prepai.edu.in",
    college: "DTU Delhi",
    degree: "B.Tech",
    branch: "Software Engineering",
    year: "3rd Year",
    skills: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript", "AWS", "Git"],
    concepts: ["Full Stack Architecture", "RESTful Web Services", "State Management"],
    goal: "Full Stack Developer",
    bio: "Passionate web developer experienced in building scalable MERN stack web applications with responsive design and seamless cloud deployments.",
    projects: [
      {
        title: "Agile Task Management Workspace",
        description: "Kanban board collaboration web application with role-based access control.",
        techStack: ["React", "Node.js", "MongoDB", "Express"],
        githubUrl: "https://github.com/demo/agile-workspace"
      }
    ],
    codingProfiles: {
      github: "https://github.com/sneha-g-demo",
      linkedin: "https://linkedin.com/in/sneha-gupta-demo"
    }
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh.demo@prepai.edu.in",
    college: "IIT Madras",
    degree: "B.Tech",
    branch: "Electrical & Computer Engineering",
    year: "4th Year",
    skills: ["AWS", "Terraform", "Docker", "Linux", "CloudFormation", "Python", "Networking"],
    concepts: ["Infrastructure as Code", "VPC Architecture", "Cloud Security"],
    goal: "Cloud Architect",
    bio: "Cloud infrastructure developer focused on AWS IaC terraform scripts, multi-region failovers, and container orchestrations.",
    projects: [
      {
        title: "Automated Multi-Region Infrastructure",
        description: "Terraform modules deploying secure AWS VPC, ECS cluster, and RDS Multi-AZ DB.",
        techStack: ["Terraform", "AWS", "Docker", "Bash"],
        githubUrl: "https://github.com/demo/aws-terraform-infra"
      }
    ],
    codingProfiles: {
      github: "https://github.com/vikram-s-demo"
    }
  },
  {
    name: "Kavya Nair",
    email: "kavya.nair.demo@prepai.edu.in",
    college: "VIT Vellore",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Jenkins", "Linux", "Bash"],
    concepts: ["Containerization", "GitOps", "Site Reliability Engineering"],
    goal: "DevOps Engineer",
    bio: "DevOps practitioner passionate about building continuous integration pipelines, automated zero-downtime deployments, and SRE monitoring.",
    projects: [
      {
        title: "GitOps Kubernetes Pipeline",
        description: "Automated continuous delivery setup using ArgoCD, Helm, and GitHub Actions.",
        techStack: ["Kubernetes", "ArgoCD", "Helm", "Docker"],
        githubUrl: "https://github.com/demo/gitops-pipeline"
      }
    ],
    codingProfiles: {
      github: "https://github.com/kavya-nair-demo",
      linkedin: "https://linkedin.com/in/kavya-nair-demo"
    }
  },
  {
    name: "Rahul Sundaram",
    email: "rahul.sundaram.demo@prepai.edu.in",
    college: "Anna University",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "3rd Year",
    skills: ["Python", "PySpark", "SQL", "AWS Redshift", "ETL Pipelines", "Data Warehousing"],
    concepts: ["MapReduce", "Data Partitioning", "Big Data Analytics"],
    goal: "Data Engineer",
    bio: "Big data engineering student building scalable PySpark batch scripts, cloud data lakes, and automated Airflow data pipelines.",
    projects: [
      {
        title: "Real-Time Clickstream ETL Pipeline",
        description: "High-throughput stream processing pipeline using Apache Kafka, PySpark, and AWS S3.",
        techStack: ["PySpark", "Kafka", "AWS S3", "Python"],
        githubUrl: "https://github.com/demo/clickstream-etl"
      }
    ],
    codingProfiles: {
      github: "https://github.com/rahul-s-demo"
    }
  },
  {
    name: "Divya Iyer",
    email: "divya.iyer.demo@prepai.edu.in",
    college: "SRM Institute",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["SQL", "Python", "PowerBI", "Tableau", "Excel", "Statistics"],
    concepts: ["Exploratory Data Analysis", "Business Analytics", "Statistical Modeling"],
    goal: "Data Analyst",
    bio: "Data analytics enthusiast skilled in extracting insights from relational databases, building PowerBI reports, and statistical hypothesis testing.",
    projects: [
      {
        title: "Customer Churn Prediction Analytics",
        description: "Exploratory analysis and predictive modeling of telecom customer churn drivers.",
        techStack: ["Python", "Pandas", "PowerBI", "SQL"],
        githubUrl: "https://github.com/demo/churn-analytics"
      }
    ],
    codingProfiles: {
      github: "https://github.com/divya-iyer-demo",
      linkedin: "https://linkedin.com/in/divya-iyer-demo"
    }
  },
  {
    name: "Karthik Reddy",
    email: "karthik.reddy.demo@prepai.edu.in",
    college: "JNTU Hyderabad",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Flutter", "React Native", "Android SDK", "Kotlin", "Java", "REST APIs"],
    concepts: ["Cross-Platform Mobile Dev", "Mobile UI State Management", "Offline Caching"],
    goal: "Mobile Application Developer",
    bio: "Cross-platform mobile engineer specializing in Flutter and Kotlin Native Android apps with clean architectural patterns.",
    projects: [
      {
        title: "Fitness Tracker Mobile Application",
        description: "Feature-rich Flutter app with step tracking, offline sync, and REST API backend.",
        techStack: ["Flutter", "Dart", "Firebase", "Provider"],
        githubUrl: "https://github.com/demo/flutter-fitness"
      }
    ],
    codingProfiles: {
      github: "https://github.com/karthik-reddy-demo"
    }
  },
  {
    name: "Meera Banerjee",
    email: "meera.banerjee.demo@prepai.edu.in",
    college: "Jadavpur University",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Selenium", "Java", "Python", "Automated Testing", "JUnit", "Postman"],
    concepts: ["Page Object Model", "API Testing", "Continuous Quality Engineering"],
    goal: "QA Automation Engineer",
    bio: "Software testing student with expertise in Selenium WebDriver automation frameworks, JUnit test execution, and API validation.",
    projects: [
      {
        title: "Automated E-Commerce Test Framework",
        description: "Page Object Model test framework in Java Selenium integrated with Jenkins.",
        techStack: ["Java", "Selenium", "TestNG", "Maven"],
        githubUrl: "https://github.com/demo/qa-selenium-framework"
      }
    ],
    codingProfiles: {
      github: "https://github.com/meera-b-demo",
      linkedin: "https://linkedin.com/in/meera-banerjee-demo"
    }
  },
  {
    name: "Siddharth Mehta",
    email: "siddharth.mehta.demo@prepai.edu.in",
    college: "COEP Pune",
    degree: "B.Tech",
    branch: "Computer Engineering",
    year: "4th Year",
    skills: ["Network Security", "Penetration Testing", "Python", "SIEM", "Cryptography", "Linux"],
    concepts: ["Vulnerability Assessment", "Ethical Hacking", "OWASP Top 10"],
    goal: "Cybersecurity Analyst",
    bio: "Security researcher focused on web application penetration testing, network packet analysis, and zero-trust security architectures.",
    projects: [
      {
        title: "Automated Web Vulnerability Scanner",
        description: "Python-based security scanner identifying SQL injection and XSS flaws in web apps.",
        techStack: ["Python", "Scapy", "Linux", "Bash"],
        githubUrl: "https://github.com/demo/web-security-scanner"
      }
    ],
    codingProfiles: {
      github: "https://github.com/siddharth-m-demo"
    }
  },
  {
    name: "Neha Joshi",
    email: "neha.joshi.demo@prepai.edu.in",
    college: "IGDTUW Delhi",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["SQL", "AWS QuickSight", "Data Modeling", "ETL", "Python", "Tableau"],
    concepts: ["Dimensional Modeling", "Data Wrangling", "Executive Dashboards"],
    goal: "Business Intelligence Engineer",
    bio: "Business intelligence practitioner building star-schema data models and executive QuickSight performance monitoring views.",
    projects: [
      {
        title: "Supply Chain Performance BI Dashboard",
        description: "Interactive operational dashboard analyzing warehouse throughput and shipment delays.",
        techStack: ["SQL", "Tableau", "Python", "Redshift"],
        githubUrl: "https://github.com/demo/bi-supply-chain"
      }
    ],
    codingProfiles: {
      github: "https://github.com/neha-joshi-demo",
      linkedin: "https://linkedin.com/in/neha-joshi-demo"
    }
  },
  {
    name: "Tarun Deshmukh",
    email: "tarun.deshmukh.demo@prepai.edu.in",
    college: "VNIT Nagpur",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["AWS", "System Architecture", "Distributed Systems", "Cloud Infrastructure", "Networking"],
    concepts: ["High Availability Architecture", "Load Balancing", "Disaster Recovery"],
    goal: "Solutions Architect",
    bio: "Cloud architecture enthusiast exploring AWS well-architected framework design principles and resilient microservice backbones.",
    projects: [
      {
        title: "Fault-Tolerant Cloud Video Transcoder",
        description: "Serverless video processing pipeline utilizing AWS Lambda, SQS, and S3 events.",
        techStack: ["AWS Lambda", "SQS", "DynamoDB", "Python"],
        githubUrl: "https://github.com/demo/serverless-transcoder"
      }
    ],
    codingProfiles: {
      github: "https://github.com/tarun-d-demo"
    }
  },
  {
    name: "Pooja Agarwal",
    email: "pooja.agarwal.demo@prepai.edu.in",
    college: "MNNIT Allahabad",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "4th Year",
    skills: ["Java", "C++", "Data Structures", "Algorithms", "DBMS", "OS"],
    concepts: ["Problem Solving", "Algorithm Optimization", "Concurrency"],
    goal: "Software Engineer",
    bio: "Competitive programmer (LeetCode Knight) with strong problem-solving skills in C++ and Java algorithmic optimization.",
    projects: [
      {
        title: "Memory-Efficient Search Engine Indexer",
        description: "Inverted index generator in C++ utilizing trie data structures for fast document retrieval.",
        techStack: ["C++", "STL", "Linux"],
        githubUrl: "https://github.com/demo/cpp-search-index"
      }
    ],
    codingProfiles: {
      github: "https://github.com/pooja-a-demo",
      leetcode: "https://leetcode.com/pooja_demo"
    }
  },
  {
    name: "Varun Nambiar",
    email: "varun.nambiar.demo@prepai.edu.in",
    college: "IIT Palakkad",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Redux"],
    concepts: ["Virtual DOM", "Component Driven Development", "Performance Profiling"],
    goal: "Frontend Engineer",
    bio: "Frontend craftsman dedicated to pixel-perfect web interfaces, CSS grid layouts, and fast TypeScript React components.",
    projects: [
      {
        title: "Design System UI Component Library",
        description: "Accessible, customizable React UI component library published on Storybook.",
        techStack: ["React", "TypeScript", "TailwindCSS", "Storybook"],
        githubUrl: "https://github.com/demo/react-design-system"
      }
    ],
    codingProfiles: {
      github: "https://github.com/varun-nambiar-demo"
    }
  },
  {
    name: "Ishita Roy",
    email: "ishita.roy.demo@prepai.edu.in",
    college: "Heritage Institute of Technology",
    degree: "B.Tech",
    branch: "CSE",
    year: "4th Year",
    skills: ["Python", "Machine Learning", "PyTorch", "NLP", "Pandas", "NumPy"],
    concepts: ["Text Classification", "Sentiment Analysis", "Feature Engineering"],
    goal: "Machine Learning Researcher",
    bio: "Data science and NLP enthusiast working on BERT text classification, sentiment extraction, and automated text summarization.",
    projects: [
      {
        title: "Financial News Sentiment Analyzer",
        description: "Fine-tuned DistilBERT transformer classifying stock market news articles in real-time.",
        techStack: ["Python", "PyTorch", "Transformers", "FastAPI"],
        githubUrl: "https://github.com/demo/news-sentiment-bert"
      }
    ],
    codingProfiles: {
      github: "https://github.com/ishita-r-demo",
      linkedin: "https://linkedin.com/in/ishita-roy-demo"
    }
  },
  {
    name: "Manish Kumar",
    email: "manish.kumar.demo@prepai.edu.in",
    college: "BIT Mesra",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Python", "Django", "Node.js", "Express.js", "PostgreSQL", "Docker"],
    concepts: ["Relational Schema Design", "ORMs", "API Rate Limiting"],
    goal: "Backend Developer",
    bio: "Backend developer specializing in Django REST framework and Node.js server development with PostgreSQL relational databases.",
    projects: [
      {
        title: "Multi-Tenant SaaS Subscription Backend",
        description: "Django REST API with database tenancy, JWT auth, and Stripe webhook handling.",
        techStack: ["Python", "Django", "PostgreSQL", "Redis"],
        githubUrl: "https://github.com/demo/django-saas-backend"
      }
    ],
    codingProfiles: {
      github: "https://github.com/manish-k-demo"
    }
  },
  {
    name: "Shruti Kulkarni",
    email: "shruti.kulkarni.demo@prepai.edu.in",
    college: "PES University Bengaluru",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["React", "Node.js", "TypeScript", "GraphQL", "MongoDB", "Docker"],
    concepts: ["GraphQL Schemas", "Apollo Client", "Serverless Deployment"],
    goal: "Full Stack Software Engineer",
    bio: "Full stack engineering student experienced in GraphQL APIs, TypeScript React frontends, and containerized microservice backends.",
    projects: [
      {
        title: "Event Booking Platform with GraphQL",
        description: "Full stack event ticketing platform featuring real-time seating availability using GraphQL subscriptions.",
        techStack: ["React", "Node.js", "GraphQL", "Apollo", "MongoDB"],
        githubUrl: "https://github.com/demo/graphql-event-booking"
      }
    ],
    codingProfiles: {
      github: "https://github.com/shruti-k-demo",
      linkedin: "https://linkedin.com/in/shruti-kulkarni-demo"
    }
  },

  // --- 30 ADDITIONAL STUDENT APPLICANTS ---
  {
    name: "Kabir Verma",
    email: "kabir.verma.demo@prepai.edu.in",
    college: "IIT Delhi",
    degree: "B.Tech",
    branch: "Computer Science & Engineering",
    year: "4th Year",
    skills: ["Java", "Data Structures", "Algorithms", "SQL", "DBMS", "OOP"],
    concepts: ["System Design", "Multithreading", "Database Indexing"],
    goal: "Backend SDE at Amazon",
    bio: "Passionate Java developer focused on data structures, algorithmic complexity, and scalable database schemas.",
    projects: [
      {
        title: "High-Throughput Chat Server",
        description: "Low-latency asynchronous chat backend using Java Netty and Redis pub-sub.",
        techStack: ["Java", "Netty", "Redis", "Docker"],
        githubUrl: "https://github.com/demo/java-chat-server"
      }
    ],
    codingProfiles: {
      github: "https://github.com/kabir-verma-demo",
      leetcode: "https://leetcode.com/kabir_v_demo"
    }
  },
  {
    name: "Riya Sen",
    email: "riya.sen.demo@prepai.edu.in",
    college: "BITS Hyderabad",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["React", "JavaScript", "Node.js", "MongoDB", "Express.js", "HTML5", "CSS3"],
    concepts: ["MERN Architecture", "REST APIs", "DOM Manipulation"],
    goal: "MERN Stack Web Developer",
    bio: "Frontend and full-stack enthusiast building interactive React applications with Express microservice backends.",
    projects: [
      {
        title: "Taskflow - Interactive Kanban Board",
        description: "Feature-packed agile sprint management workspace with drag-and-drop card columns.",
        techStack: ["React", "Node.js", "MongoDB", "Express"],
        githubUrl: "https://github.com/demo/taskflow-web"
      }
    ],
    codingProfiles: {
      github: "https://github.com/riya-sen-demo",
      linkedin: "https://linkedin.com/in/riya-sen-demo"
    }
  },
  {
    name: "Yashwardhan Chhabra",
    email: "yash.chhabra.demo@prepai.edu.in",
    college: "IIIT Bangalore",
    degree: "M.Tech",
    branch: "Data Science",
    year: "2nd Year",
    skills: ["Python", "Machine Learning", "Pandas", "Scikit-Learn", "NumPy", "Matplotlib"],
    concepts: ["Supervised Learning", "Feature Selection", "Cross Validation"],
    goal: "Machine Learning Engineer / Data Scientist",
    bio: "Graduate data science student specializing in predictive ML modeling, pandas feature engineering, and statistical analytics.",
    projects: [
      {
        title: "Customer Churn Predictor",
        description: "Gradient boosting classifier web app predicting telecom subscriber churn.",
        techStack: ["Python", "Scikit-Learn", "Streamlit"],
        githubUrl: "https://github.com/demo/churn-predictor"
      }
    ],
    codingProfiles: {
      github: "https://github.com/yash-chhabra-demo"
    }
  },
  {
    name: "Avani Deshpande",
    email: "avani.deshpande.demo@prepai.edu.in",
    college: "VJTI Mumbai",
    degree: "B.Tech",
    branch: "Computer Engineering",
    year: "4th Year",
    skills: ["C++", "Data Structures", "Algorithms", "DBMS", "SQL", "Linux"],
    concepts: ["Object-Oriented Programming", "Memory Management", "Graph Algorithms"],
    goal: "Software Engineer - Core Systems",
    bio: "Competitive programmer and C++ enthusiast building low-level memory allocators and high-speed data structures.",
    projects: [
      {
        title: "Custom Memory Allocator in C++",
        description: "Custom free-list memory pool manager replacing standard C++ malloc overhead.",
        techStack: ["C++", "Linux", "GDB"],
        githubUrl: "https://github.com/demo/cpp-allocator"
      }
    ],
    codingProfiles: {
      github: "https://github.com/avani-d-demo",
      leetcode: "https://leetcode.com/avani_demo"
    }
  },
  {
    name: "Harshvardhan Rathore",
    email: "harsh.rathore.demo@prepai.edu.in",
    college: "NIT Trichy",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Java", "Spring Boot", "SQL", "PostgreSQL", "Hibernate", "REST APIs"],
    concepts: ["Spring MVC", "Dependency Injection", "JPA Hibernate ORM"],
    goal: "Java Backend Developer",
    bio: "Experienced in building enterprise Java backends using Spring Boot, Hibernate ORM, and PostgreSQL.",
    projects: [
      {
        title: "Inventory Management Microservice",
        description: "RESTful inventory catalog microservice with OAuth2 authorization.",
        techStack: ["Java", "Spring Boot", "PostgreSQL"],
        githubUrl: "https://github.com/demo/inventory-spring"
      }
    ],
    codingProfiles: {
      github: "https://github.com/harsh-r-demo",
      linkedin: "https://linkedin.com/in/harsh-rathore-demo"
    }
  },
  {
    name: "Tanvi Saxena",
    email: "tanvi.saxena.demo@prepai.edu.in",
    college: "NSUT Delhi",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "3rd Year",
    skills: ["Python", "Pandas", "SQL", "Excel", "Data Visualization", "Matplotlib"],
    concepts: ["Exploratory Data Analysis", "Data Wrangling", "Dashboarding"],
    goal: "Data Analyst",
    bio: "Analytical thinker skilled in converting raw tabular data into clear business insights and statistical visual charts.",
    projects: [
      {
        title: "E-Commerce Sales Trend Dashboard",
        description: "Exploratory analysis identifying regional purchasing velocity and product category revenue.",
        techStack: ["Python", "Pandas", "Seaborn"],
        githubUrl: "https://github.com/demo/sales-analysis"
      }
    ],
    codingProfiles: {
      github: "https://github.com/tanvi-saxena-demo"
    }
  },
  {
    name: "Pranav Hegde",
    email: "pranav.hegde.demo@prepai.edu.in",
    college: "RVCE Bengaluru",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["React", "Node.js", "Express.js", "JavaScript", "TailwindCSS", "PostgreSQL"],
    concepts: ["Single Page Applications", "Asynchronous JS", "REST APIs"],
    goal: "Full Stack Developer",
    bio: "Web developer crafting sleek Tailwind UI components with Express API integrations and relational DB schema design.",
    projects: [
      {
        title: "Event Hub Platform",
        description: "Community event listing and ticket booking portal built with React and Node.",
        techStack: ["React", "Node.js", "PostgreSQL"],
        githubUrl: "https://github.com/demo/event-hub"
      }
    ],
    codingProfiles: {
      github: "https://github.com/pranav-hegde-demo",
      linkedin: "https://linkedin.com/in/pranav-hegde-demo"
    }
  },
  {
    name: "Simran Kaur",
    email: "simran.kaur.demo@prepai.edu.in",
    college: "PEC Chandigarh",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["AWS", "Docker", "Linux", "Python", "Cloud Infrastructure", "Terraform"],
    concepts: ["Cloud Security", "Container Management", "IaC Automation"],
    goal: "Cloud Engineer",
    bio: "Cloud computing enthusiast creating Dockerized containers, AWS EC2 deploy automations, and Terraform cloud scripts.",
    projects: [
      {
        title: "AWS EC2 Auto-Scaler & Monitor",
        description: "Custom Python script launching EC2 instances dynamically based on CloudWatch CPU load metrics.",
        techStack: ["AWS", "Docker", "Python"],
        githubUrl: "https://github.com/demo/aws-autoscaler"
      }
    ],
    codingProfiles: {
      github: "https://github.com/simran-kaur-demo"
    }
  },
  {
    name: "Devansh Kapoor",
    email: "devansh.kapoor.demo@prepai.edu.in",
    college: "IIIT Allahabad",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "4th Year",
    skills: ["Cybersecurity", "Python", "Networking", "Wireshark", "Linux", "Penetration Testing"],
    concepts: ["Network Protocols (TCP/IP)", "OWASP Top 10", "Ethical Hacking"],
    goal: "Security Analyst / Cyber Specialist",
    bio: "Cybersecurity researcher focused on network packet inspection, penetration testing, and ethical hacking scripts.",
    projects: [
      {
        title: "Network Packet Analyzer & Intrusion Monitor",
        description: "Python network sniffer parsing TCP headers and detecting suspicious port scanning activity.",
        techStack: ["Python", "Scapy", "Linux"],
        githubUrl: "https://github.com/demo/packet-analyzer"
      }
    ],
    codingProfiles: {
      github: "https://github.com/devansh-k-demo",
      linkedin: "https://linkedin.com/in/devansh-kapoor-demo"
    }
  },
  {
    name: "Anshuman Mishra",
    email: "anshuman.mishra.demo@prepai.edu.in",
    college: "Thapar Institute",
    degree: "B.Tech",
    branch: "Computer Engineering",
    year: "4th Year",
    skills: ["C++", "Operating Systems", "DBMS", "SQL", "System Programming", "Multithreading"],
    concepts: ["Process Synchronization", "File Systems", "Deadlock Prevention"],
    goal: "Systems Software Engineer",
    bio: "Core systems developer proficient in OS concepts, thread scheduling algorithms, and C++ system software design.",
    projects: [
      {
        title: "Multi-Threaded Web Server in C++",
        description: "POSIX socket web server handling HTTP GET requests using a thread pool worker queue.",
        techStack: ["C++", "Pthreads", "Sockets"],
        githubUrl: "https://github.com/demo/cpp-webserver"
      }
    ],
    codingProfiles: {
      github: "https://github.com/anshuman-m-demo"
    }
  },
  {
    name: "Gautam Bhat",
    email: "gautam.bhat.demo@prepai.edu.in",
    college: "NIT Warangal",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Java", "Data Structures", "Algorithms", "Spring Boot", "Microservices"],
    concepts: ["Design Patterns", "Spring Cloud", "RESTful Architecture"],
    goal: "Software Development Engineer",
    bio: "Backend software engineer with focus on Java OOP principles, algorithm design, and microservices architecture.",
    projects: [
      {
        title: "Banking Transaction Microservice",
        description: "Spring Boot microservices architecture processing concurrent account transfers securely.",
        techStack: ["Java", "Spring Boot", "Eureka"],
        githubUrl: "https://github.com/demo/spring-banking"
      }
    ],
    codingProfiles: {
      github: "https://github.com/gautam-bhat-demo",
      leetcode: "https://leetcode.com/gautam_demo"
    }
  },
  {
    name: "Ishaan Malhotra",
    email: "ishaan.malhotra.demo@prepai.edu.in",
    college: "IIIT Delhi",
    degree: "B.Tech",
    branch: "Computer Science & Social Sciences",
    year: "4th Year",
    skills: ["Python", "TensorFlow", "PyTorch", "Generative AI", "LLMs", "LangChain"],
    concepts: ["Transformer Models", "RAG Systems", "Natural Language Processing"],
    goal: "AI/ML Research Engineer",
    bio: "AI researcher building RAG document Q&A pipelines, prompt engineering pipelines, and fine-tuned generative AI agents.",
    projects: [
      {
        title: "Intelligent PDF Question-Answering Bot",
        description: "RAG chatbot indexing PDF documents using LangChain embeddings and Chroma vector store.",
        techStack: ["Python", "LangChain", "ChromaDB"],
        githubUrl: "https://github.com/demo/pdf-qa-bot"
      }
    ],
    codingProfiles: {
      github: "https://github.com/ishaan-m-demo",
      linkedin: "https://linkedin.com/in/ishaan-malhotra-demo"
    }
  },
  {
    name: "Shreya Pillai",
    email: "shreya.pillai.demo@prepai.edu.in",
    college: "Amrita Vishwa Vidyapeetham",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Flutter", "Dart", "Firebase", "Mobile App Development", "REST APIs"],
    concepts: ["State Management (Bloc/Provider)", "Mobile UI Design", "Push Notifications"],
    goal: "Flutter Mobile Developer",
    bio: "Mobile app developer creating cross-platform Flutter applications with Firebase authentication and real-time database backends.",
    projects: [
      {
        title: "Food Delivery Mobile App",
        description: "Cross-platform mobile application featuring interactive restaurant menus and order tracking.",
        techStack: ["Flutter", "Dart", "Firebase"],
        githubUrl: "https://github.com/demo/flutter-food"
      }
    ],
    codingProfiles: {
      github: "https://github.com/shreya-pillai-demo"
    }
  },
  {
    name: "Nikhil Nambiar",
    email: "nikhil.nambiar.demo@prepai.edu.in",
    college: "NIT Calicut",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Python", "PySpark", "SQL", "Apache Kafka", "Big Data", "ETL"],
    concepts: ["Distributed Data Processing", "Data Pipelines", "Data Warehousing"],
    goal: "Data Engineer",
    bio: "Big data engineer experienced in processing high-throughput data streams with PySpark and Apache Kafka.",
    projects: [
      {
        title: "Real-time Traffic Telemetry Pipeline",
        description: "Streaming telemetry ingest pipeline aggregating city traffic sensor metrics in real-time.",
        techStack: ["PySpark", "Kafka", "AWS S3"],
        githubUrl: "https://github.com/demo/pyspark-traffic"
      }
    ],
    codingProfiles: {
      github: "https://github.com/nikhil-nambiar-demo",
      linkedin: "https://linkedin.com/in/nikhil-nambiar-demo"
    }
  },
  {
    name: "Kriti Tandon",
    email: "kriti.tandon.demo@prepai.edu.in",
    college: "SPIT Mumbai",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "4th Year",
    skills: ["React", "TypeScript", "Redux", "HTML5", "CSS3", "Jest"],
    concepts: ["Frontend State Management", "Component Testing", "Responsive Web Design"],
    goal: "Frontend Software Engineer",
    bio: "Passionate frontend developer who creates modern, responsive user interfaces with React, TypeScript, and Redux Toolkit.",
    projects: [
      {
        title: "Analytics Dashboard UI",
        description: "Modular React dashboard rendering high-density charts and real-time WebSocket feeds.",
        techStack: ["React", "TypeScript", "Recharts"],
        githubUrl: "https://github.com/demo/analytics-ui"
      }
    ],
    codingProfiles: {
      github: "https://github.com/kriti-tandon-demo"
    }
  },
  {
    name: "Chirag Shetty",
    email: "chirag.shetty.demo@prepai.edu.in",
    college: "BMSCE Bengaluru",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Linux", "Bash"],
    concepts: ["Continuous Integration", "Container Orchestration", "GitOps Workflow"],
    goal: "DevOps / SRE Engineer",
    bio: "DevOps practitioner specializing in automated CI/CD build scripts, Docker containerization, and Kubernetes deployments.",
    projects: [
      {
        title: "Automated CI/CD Pipeline for Microservices",
        description: "GitHub Actions workflow running unit tests, building Docker images, and deploying to EKS.",
        techStack: ["GitHub Actions", "Docker", "K8s"],
        githubUrl: "https://github.com/demo/cicd-pipeline"
      }
    ],
    codingProfiles: {
      github: "https://github.com/chirag-shetty-demo",
      linkedin: "https://linkedin.com/in/chirag-shetty-demo"
    }
  },
  {
    name: "Bhavna Bhatt",
    email: "bhavna.bhatt.demo@prepai.edu.in",
    college: "IIT Kharagpur",
    degree: "M.Tech",
    branch: "Computer Science",
    year: "2nd Year",
    skills: ["Java", "C++", "System Design", "SQL", "Algorithms", "Object-Oriented Design"],
    concepts: ["Distributed Caching", "Load Balancing", "Consistent Hashing"],
    goal: "Senior SDE / Systems Engineer",
    bio: "Graduate student working on high-scalability distributed architectures, cache synchronization, and low-latency database queries.",
    projects: [
      {
        title: "Distributed Cache System",
        description: "In-memory key-value cache cluster with LRU eviction and consistent hashing partition.",
        techStack: ["Java", "Redis", "Docker"],
        githubUrl: "https://github.com/demo/distributed-cache"
      }
    ],
    codingProfiles: {
      github: "https://github.com/bhavna-bhatt-demo",
      leetcode: "https://leetcode.com/bhavna_demo"
    }
  },
  {
    name: "Manan Trivedi",
    email: "manan.trivedi.demo@prepai.edu.in",
    college: "DA-IICT Gandhinagar",
    degree: "B.Tech",
    branch: "Information & Communication Technology",
    year: "4th Year",
    skills: ["Python", "Machine Learning", "Pandas", "Scikit-Learn", "SQL", "Flask"],
    concepts: ["Feature Extraction", "Predictive Analytics", "Model Deployment"],
    goal: "ML Software Engineer",
    bio: "Machine learning enthusiast deploying ML prediction pipelines behind Flask REST APIs.",
    projects: [
      {
        title: "Housing Price Predictor Service",
        description: "Random Forest regressor model exposed as a lightweight REST microservice.",
        techStack: ["Python", "Scikit-Learn", "Flask"],
        githubUrl: "https://github.com/demo/ml-housing"
      }
    ],
    codingProfiles: {
      github: "https://github.com/manan-trivedi-demo"
    }
  },
  {
    name: "Ridhi Agrawal",
    email: "ridhi.agrawal.demo@prepai.edu.in",
    college: "IIIT Gwalior",
    degree: "Integrated B.Tech + M.Tech",
    branch: "IT",
    year: "4th Year",
    skills: ["React", "Node.js", "Express.js", "MongoDB", "Redux", "JavaScript"],
    concepts: ["Full Stack Development", "JWT Authentication", "WebSockets"],
    goal: "Full Stack Engineer",
    bio: "MERN stack developer skilled in building real-time collaboration apps with WebSockets and JWT security.",
    projects: [
      {
        title: "Real-time Whiteboard Collaboration Tool",
        description: "Canvas-based live drawing application with WebSocket room sync.",
        techStack: ["React", "Node.js", "Socket.io"],
        githubUrl: "https://github.com/demo/whiteboard-app"
      }
    ],
    codingProfiles: {
      github: "https://github.com/ridhi-agrawal-demo",
      linkedin: "https://linkedin.com/in/ridhi-agrawal-demo"
    }
  },
  {
    name: "Tushar Bansal",
    email: "tushar.bansal.demo@prepai.edu.in",
    college: "NIT Rourkela",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["SQL", "PowerBI", "Python", "Tableau", "Excel", "Data Modeling"],
    concepts: ["Business Intelligence", "DAX Expressions", "Data Visualization"],
    goal: "BI / Data Analyst",
    bio: "Data analyst skilled in writing complex SQL joins, building interactive PowerBI dashboards, and extracting business trends.",
    projects: [
      {
        title: "Retail Store BI Performance Report",
        description: "Interactive PowerBI dashboard modeling customer lifetime value and product margin.",
        techStack: ["PowerBI", "SQL", "Excel"],
        githubUrl: "https://github.com/demo/powerbi-retail"
      }
    ],
    codingProfiles: {
      github: "https://github.com/tushar-bansal-demo"
    }
  },
  {
    name: "Aditi Varma",
    email: "aditi.varma.demo@prepai.edu.in",
    college: "PSG College of Technology",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Selenium", "Java", "TestNG", "Postman", "API Testing", "JUnit"],
    concepts: ["Test Automation", "Page Object Model", "API Validation"],
    goal: "QA Automation Test Engineer",
    bio: "Quality assurance engineer building automated test suites for web applications and API verification using Java Selenium.",
    projects: [
      {
        title: "E-Commerce Automated Testing Suite",
        description: "Cross-browser end-to-end regression test suite automating checkout user journeys.",
        techStack: ["Java", "Selenium", "TestNG"],
        githubUrl: "https://github.com/demo/qa-ecommerce-tests"
      }
    ],
    codingProfiles: {
      github: "https://github.com/aditi-varma-demo",
      linkedin: "https://linkedin.com/in/aditi-varma-demo"
    }
  },
  {
    name: "Varun Singhal",
    email: "varun.singhal.demo@prepai.edu.in",
    college: "MNIT Jaipur",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["AWS", "Cloud Infrastructure", "Terraform", "Linux", "Python", "Docker"],
    concepts: ["Cloud Architecture", "AWS IAM", "VPC Subnetting"],
    goal: "Solutions Architect Intern",
    bio: "Cloud practitioner designing secure AWS multi-tier architecture with automated Terraform scripts.",
    projects: [
      {
        title: "Multi-Tier AWS Web Architecture",
        description: "Terraform template provisioning ALB load balancer, Auto-Scaling Group, and RDS database.",
        techStack: ["Terraform", "AWS", "Nginx"],
        githubUrl: "https://github.com/demo/aws-multitier"
      }
    ],
    codingProfiles: {
      github: "https://github.com/varun-singhal-demo"
    }
  },
  {
    name: "Payal Chauhan",
    email: "payal.chauhan.demo@prepai.edu.in",
    college: "MIT Manipal",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Java", "Data Structures", "Algorithms", "C++", "SQL"],
    concepts: ["Object-Oriented Programming", "Array Manipulation", "Dynamic Programming"],
    goal: "SDE Intern",
    bio: "Problem solver enthusiastic about algorithmic puzzles, array manipulations, and clean object-oriented code.",
    projects: [
      {
        title: "Dynamic Programming Problem Solver Library",
        description: "C++ / Java algorithms library implementing classic dynamic programming patterns.",
        techStack: ["Java", "C++"],
        githubUrl: "https://github.com/demo/dp-solver"
      }
    ],
    codingProfiles: {
      github: "https://github.com/payal-chauhan-demo",
      leetcode: "https://leetcode.com/payal_demo"
    }
  },
  {
    name: "Sarthak Kulkarni",
    email: "sarthak.kulkarni.demo@prepai.edu.in",
    college: "Walchand College of Engineering",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["C++", "Operating Systems", "DBMS", "Computer Networks", "Linux"],
    concepts: ["Process Scheduling", "Socket Programming", "Virtual Memory"],
    goal: "Systems Software Engineer",
    bio: "Systems programmer exploring Linux socket communication, thread synchronization, and C++ network daemons.",
    projects: [
      {
        title: "Lightweight Linux HTTP Server in C++",
        description: "Non-blocking epoll web server in C++ processing HTTP requests.",
        techStack: ["C++", "Linux", "Epoll"],
        githubUrl: "https://github.com/demo/cpp-epoll-server"
      }
    ],
    codingProfiles: {
      github: "https://github.com/sarthak-k-demo"
    }
  },
  {
    name: "Anika Roy",
    email: "anika.roy.demo@prepai.edu.in",
    college: "IIIT Lucknow",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["React", "JavaScript", "HTML5", "CSS3", "TailwindCSS", "Node.js"],
    concepts: ["Responsive Web Design", "REST API Integration", "UI/UX Best Practices"],
    goal: "Frontend Web Developer",
    bio: "Frontend designer building modern responsive user interfaces with Tailwind CSS and React hooks.",
    projects: [
      {
        title: "Developer Portfolio Builder Web App",
        description: "Interactive portfolio customizer producing clean static React resume templates.",
        techStack: ["React", "TailwindCSS"],
        githubUrl: "https://github.com/demo/portfolio-builder"
      }
    ],
    codingProfiles: {
      github: "https://github.com/anika-roy-demo",
      linkedin: "https://linkedin.com/in/anika-roy-demo"
    }
  },
  {
    name: "Karan Grover",
    email: "karan.grover.demo@prepai.edu.in",
    college: "IIIT Jabalpur",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Python", "Generative AI", "PyTorch", "LLMs", "NLP", "LangChain"],
    concepts: ["Large Language Models", "Prompt Engineering", "Fine-Tuning"],
    goal: "AI/ML Engineer",
    bio: "Machine learning engineer working on Generative AI, transformer models, and LLM text summarizing agents.",
    projects: [
      {
        title: "AI Summarizer & Document Assistant",
        description: "Document summary pipeline fine-tuning HuggingFace BART model on research papers.",
        techStack: ["Python", "PyTorch", "HuggingFace"],
        githubUrl: "https://github.com/demo/ai-summarizer"
      }
    ],
    codingProfiles: {
      github: "https://github.com/karan-grover-demo"
    }
  },
  {
    name: "Meghna Sengupta",
    email: "meghna.sengupta.demo@prepai.edu.in",
    college: "SASTRA University",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Java", "Spring Boot", "SQL", "PostgreSQL", "Docker", "REST APIs"],
    concepts: ["Microservices", "Database Transactions", "Spring Security"],
    goal: "Backend Engineer",
    bio: "Java backend developer skilled in Spring Boot REST APIs, database transactions, and microservice decoupling.",
    projects: [
      {
        title: "E-Learning Course Backend API",
        description: "Secure course enrollment REST backend with Spring Security JWT tokens.",
        techStack: ["Java", "Spring Boot", "PostgreSQL"],
        githubUrl: "https://github.com/demo/spring-elearning"
      }
    ],
    codingProfiles: {
      github: "https://github.com/meghna-s-demo",
      linkedin: "https://linkedin.com/in/meghna-sengupta-demo"
    }
  },
  {
    name: "Rohan Mahajan",
    email: "rohan.mahajan.demo@prepai.edu.in",
    college: "SRM KTR Chennai",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Python", "Pandas", "PySpark", "SQL", "Data Analysis", "Matplotlib"],
    concepts: ["Data Analytics", "ETL Workflows", "Data Visualization"],
    goal: "Data Engineer / Data Analyst",
    bio: "Data enthusiast who loves working with large datasets, ETL data cleaning, and statistical analytical visual plots.",
    projects: [
      {
        title: "Global Climate Data Analytics",
        description: "Analyzing temperature anomalies across 50 years using PySpark and Pandas.",
        techStack: ["Python", "PySpark", "Pandas"],
        githubUrl: "https://github.com/demo/climate-data"
      }
    ],
    codingProfiles: {
      github: "https://github.com/rohan-mahajan-demo"
    }
  },
  {
    name: "Nisha Shinde",
    email: "nisha.shinde.demo@prepai.edu.in",
    college: "Kalinga Institute (KIIT)",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "4th Year",
    skills: ["Cybersecurity", "Network Security", "Python", "Linux", "Ethical Hacking"],
    concepts: ["Vulnerability Assessment", "Firewall Configuration", "Security Auditing"],
    goal: "Cybersecurity Analyst",
    bio: "Cybersecurity student focusing on vulnerability scanning, threat hunting, and Linux system security hardening.",
    projects: [
      {
        title: "Vulnerability Scanner for Linux Server",
        description: "Python script evaluating SSH configurations, firewall rules, and open ports.",
        techStack: ["Python", "Bash", "Linux"],
        githubUrl: "https://github.com/demo/linux-vuln-scanner"
      }
    ],
    codingProfiles: {
      github: "https://github.com/nisha-shinde-demo"
    }
  },
  {
    name: "Deepak Sharma",
    email: "deepak.sharma.demo@prepai.edu.in",
    college: "VJTI Mumbai",
    degree: "B.Tech",
    branch: "Computer Engineering",
    year: "4th Year",
    skills: ["React", "Node.js", "TypeScript", "AWS", "MongoDB", "Express.js"],
    concepts: ["Full Stack Engineering", "Cloud Deployment", "Microservices"],
    goal: "Full Stack Software Engineer",
    bio: "Full stack engineer experienced in building TypeScript MERN stack web applications and deploying on AWS EC2.",
    projects: [
      {
        title: "Job Match & Resume Analytics Platform",
        description: "Web platform matching student profiles to active job posts using vector similarity.",
        techStack: ["React", "Node.js", "MongoDB", "AWS"],
        githubUrl: "https://github.com/demo/job-match-platform"
      }
    ],
    codingProfiles: {
      github: "https://github.com/deepak-sharma-demo",
      linkedin: "https://linkedin.com/in/deepak-sharma-demo"
    }
  }
];

// 3. Application Mappings (Applicant Email -> Internship Index & Status)
// Distributes 50 students across 15 internships with realistic status distribution
const applicationDistribution = [
  // --- INITIAL 28 APPLICATIONS FOR FIRST 20 STUDENTS ---
  // SDE Intern (Index 0)
  { studentEmail: "aarav.sharma.demo@prepai.edu.in", internshipIndex: 0, status: "Shortlisted" },
  { studentEmail: "pooja.agarwal.demo@prepai.edu.in", internshipIndex: 0, status: "Reviewing" },
  { studentEmail: "rohan.kulkarni.demo@prepai.edu.in", internshipIndex: 0, status: "Applied" },

  // Frontend Intern (Index 1)
  { studentEmail: "ananya.verma.demo@prepai.edu.in", internshipIndex: 1, status: "Shortlisted" },
  { studentEmail: "varun.nambiar.demo@prepai.edu.in", internshipIndex: 1, status: "Reviewing" },

  // Backend Intern (Index 2)
  { studentEmail: "rohan.kulkarni.demo@prepai.edu.in", internshipIndex: 2, status: "Reviewing" },
  { studentEmail: "manish.kumar.demo@prepai.edu.in", internshipIndex: 2, status: "Applied" },

  // Full Stack Intern (Index 3)
  { studentEmail: "sneha.gupta.demo@prepai.edu.in", internshipIndex: 3, status: "Applied" },
  { studentEmail: "shruti.kulkarni.demo@prepai.edu.in", internshipIndex: 3, status: "Shortlisted" },

  // Data Engineering Intern (Index 4)
  { studentEmail: "rahul.sundaram.demo@prepai.edu.in", internshipIndex: 4, status: "Reviewing" },
  { studentEmail: "divya.iyer.demo@prepai.edu.in", internshipIndex: 4, status: "Rejected" },

  // Machine Learning Intern (Index 5)
  { studentEmail: "priya.patel.demo@prepai.edu.in", internshipIndex: 5, status: "Shortlisted" },
  { studentEmail: "ishita.roy.demo@prepai.edu.in", internshipIndex: 5, status: "Applied" },

  // AI/ML Engineering Intern (Index 6)
  { studentEmail: "aditya.rao.demo@prepai.edu.in", internshipIndex: 6, status: "Shortlisted" },
  { studentEmail: "priya.patel.demo@prepai.edu.in", internshipIndex: 6, status: "Reviewing" },

  // Cloud Engineering Intern (Index 7)
  { studentEmail: "vikram.singh.demo@prepai.edu.in", internshipIndex: 7, status: "Applied" },
  { studentEmail: "tarun.deshmukh.demo@prepai.edu.in", internshipIndex: 7, status: "Rejected" },

  // DevOps Intern (Index 8)
  { studentEmail: "kavya.nair.demo@prepai.edu.in", internshipIndex: 8, status: "Reviewing" },
  { studentEmail: "vikram.singh.demo@prepai.edu.in", internshipIndex: 8, status: "Applied" },

  // Mobile App Development Intern (Index 9)
  { studentEmail: "karthik.reddy.demo@prepai.edu.in", internshipIndex: 9, status: "Applied" },

  // QA / Software Testing Intern (Index 10)
  { studentEmail: "meera.banerjee.demo@prepai.edu.in", internshipIndex: 10, status: "Reviewing" },

  // Data Analyst Intern (Index 11)
  { studentEmail: "divya.iyer.demo@prepai.edu.in", internshipIndex: 11, status: "Shortlisted" },
  { studentEmail: "neha.joshi.demo@prepai.edu.in", internshipIndex: 11, status: "Rejected" },

  // Cybersecurity Intern (Index 12)
  { studentEmail: "siddharth.mehta.demo@prepai.edu.in", internshipIndex: 12, status: "Reviewing" },

  // Solutions Architect Intern (Index 13)
  { studentEmail: "tarun.deshmukh.demo@prepai.edu.in", internshipIndex: 13, status: "Applied" },
  { studentEmail: "vikram.singh.demo@prepai.edu.in", internshipIndex: 13, status: "Rejected" },

  // Business Intelligence Intern (Index 14)
  { studentEmail: "neha.joshi.demo@prepai.edu.in", internshipIndex: 14, status: "Applied" },
  { studentEmail: "divya.iyer.demo@prepai.edu.in", internshipIndex: 14, status: "Rejected" },

  // --- 45 ADDITIONAL APPLICATIONS FOR NEW 30 STUDENTS ---
  // SDE Intern (Index 0) - 5 new applications
  { studentEmail: "kabir.verma.demo@prepai.edu.in", internshipIndex: 0, status: "Shortlisted" },
  { studentEmail: "avani.deshpande.demo@prepai.edu.in", internshipIndex: 0, status: "Reviewing" },
  { studentEmail: "gautam.bhat.demo@prepai.edu.in", internshipIndex: 0, status: "Applied" },
  { studentEmail: "bhavna.bhatt.demo@prepai.edu.in", internshipIndex: 0, status: "Shortlisted" },
  { studentEmail: "payal.chauhan.demo@prepai.edu.in", internshipIndex: 0, status: "Applied" },

  // Frontend Intern (Index 1) - 4 new applications
  { studentEmail: "riya.sen.demo@prepai.edu.in", internshipIndex: 1, status: "Reviewing" },
  { studentEmail: "pranav.hegde.demo@prepai.edu.in", internshipIndex: 1, status: "Applied" },
  { studentEmail: "kriti.tandon.demo@prepai.edu.in", internshipIndex: 1, status: "Shortlisted" },
  { studentEmail: "anika.roy.demo@prepai.edu.in", internshipIndex: 1, status: "Applied" },

  // Backend Intern (Index 2) - 4 new applications
  { studentEmail: "harsh.rathore.demo@prepai.edu.in", internshipIndex: 2, status: "Shortlisted" },
  { studentEmail: "kabir.verma.demo@prepai.edu.in", internshipIndex: 2, status: "Reviewing" },
  { studentEmail: "gautam.bhat.demo@prepai.edu.in", internshipIndex: 2, status: "Applied" },
  { studentEmail: "meghna.sengupta.demo@prepai.edu.in", internshipIndex: 2, status: "Reviewing" },

  // Full Stack Intern (Index 3) - 4 new applications
  { studentEmail: "riya.sen.demo@prepai.edu.in", internshipIndex: 3, status: "Applied" },
  { studentEmail: "pranav.hegde.demo@prepai.edu.in", internshipIndex: 3, status: "Reviewing" },
  { studentEmail: "ridhi.agrawal.demo@prepai.edu.in", internshipIndex: 3, status: "Shortlisted" },
  { studentEmail: "deepak.sharma.demo@prepai.edu.in", internshipIndex: 3, status: "Applied" },

  // Data Engineering Intern (Index 4) - 3 new applications
  { studentEmail: "nikhil.nambiar.demo@prepai.edu.in", internshipIndex: 4, status: "Shortlisted" },
  { studentEmail: "rohan.mahajan.demo@prepai.edu.in", internshipIndex: 4, status: "Reviewing" },
  { studentEmail: "tanvi.saxena.demo@prepai.edu.in", internshipIndex: 4, status: "Rejected" },

  // Machine Learning Intern (Index 5) - 4 new applications
  { studentEmail: "yash.chhabra.demo@prepai.edu.in", internshipIndex: 5, status: "Reviewing" },
  { studentEmail: "manan.trivedi.demo@prepai.edu.in", internshipIndex: 5, status: "Applied" },
  { studentEmail: "karan.grover.demo@prepai.edu.in", internshipIndex: 5, status: "Shortlisted" },
  { studentEmail: "ishaan.malhotra.demo@prepai.edu.in", internshipIndex: 5, status: "Reviewing" },

  // AI/ML Engineering Intern (Index 6) - 3 new applications
  { studentEmail: "ishaan.malhotra.demo@prepai.edu.in", internshipIndex: 6, status: "Shortlisted" },
  { studentEmail: "karan.grover.demo@prepai.edu.in", internshipIndex: 6, status: "Reviewing" },
  { studentEmail: "yash.chhabra.demo@prepai.edu.in", internshipIndex: 6, status: "Applied" },

  // Cloud Engineering Intern (Index 7) - 3 new applications
  { studentEmail: "simran.kaur.demo@prepai.edu.in", internshipIndex: 7, status: "Reviewing" },
  { studentEmail: "varun.singhal.demo@prepai.edu.in", internshipIndex: 7, status: "Applied" },
  { studentEmail: "chirag.shetty.demo@prepai.edu.in", internshipIndex: 7, status: "Rejected" },

  // DevOps Intern (Index 8) - 3 new applications
  { studentEmail: "chirag.shetty.demo@prepai.edu.in", internshipIndex: 8, status: "Shortlisted" },
  { studentEmail: "simran.kaur.demo@prepai.edu.in", internshipIndex: 8, status: "Reviewing" },
  { studentEmail: "deepak.sharma.demo@prepai.edu.in", internshipIndex: 8, status: "Applied" },

  // Mobile App Development Intern (Index 9) - 2 new applications
  { studentEmail: "shreya.pillai.demo@prepai.edu.in", internshipIndex: 9, status: "Shortlisted" },
  { studentEmail: "anika.roy.demo@prepai.edu.in", internshipIndex: 9, status: "Reviewing" },

  // QA / Software Testing Intern (Index 10) - 2 new applications
  { studentEmail: "aditi.varma.demo@prepai.edu.in", internshipIndex: 10, status: "Shortlisted" },
  { studentEmail: "tanvi.saxena.demo@prepai.edu.in", internshipIndex: 10, status: "Applied" },

  // Data Analyst Intern (Index 11) - 2 new applications
  { studentEmail: "tanvi.saxena.demo@prepai.edu.in", internshipIndex: 11, status: "Reviewing" },
  { studentEmail: "tushar.bansal.demo@prepai.edu.in", internshipIndex: 11, status: "Applied" },

  // Cybersecurity Intern (Index 12) - 2 new applications
  { studentEmail: "devansh.kapoor.demo@prepai.edu.in", internshipIndex: 12, status: "Shortlisted" },
  { studentEmail: "nisha.shinde.demo@prepai.edu.in", internshipIndex: 12, status: "Reviewing" },

  // Solutions Architect Intern (Index 13) - 2 new applications
  { studentEmail: "varun.singhal.demo@prepai.edu.in", internshipIndex: 13, status: "Shortlisted" },
  { studentEmail: "anshuman.mishra.demo@prepai.edu.in", internshipIndex: 13, status: "Rejected" },

  // Business Intelligence Intern (Index 14) - 2 new applications
  { studentEmail: "tushar.bansal.demo@prepai.edu.in", internshipIndex: 14, status: "Reviewing" },
  { studentEmail: "rohan.mahajan.demo@prepai.edu.in", internshipIndex: 14, status: "Applied" }
];

async function seedAmazonDemoData() {
  console.log("==========================================");
  console.log("   AMAZON DEMO DATA SEEDING INITIATED     ");
  console.log("==========================================");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const dbName = mongoose.connection.name;
    console.log(`Connected to MongoDB Atlas Database: '${dbName}'`);

    if (dbName !== "prepai") {
      console.warn(`WARNING: Connected database name is '${dbName}', expected 'prepai'.`);
    }

    // 1. Locate Amazon Recruiter
    let recruiter = await User.findOne({
      role: "recruiter",
      email: "chandrikabaswa@gmail.com"
    });

    if (!recruiter) {
      recruiter = await User.findOne({
        role: "recruiter",
        companyName: /amazon/i
      });
    }

    if (!recruiter) {
      console.log("Amazon recruiter account not found. Creating default Amazon recruiter account...");
      const hashedPassword = await bcrypt.hash("Password@123", 10);
      recruiter = await User.create({
        name: "Baswa Chandrika",
        email: "chandrikabaswa@gmail.com",
        password: hashedPassword,
        role: "recruiter",
        companyName: "Amazon",
        companyWebsite: "https://amazon.jobs",
        designation: "Technical University Recruiting Lead",
        companyLocation: "Bengaluru, Karnataka",
        companyBio: "Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.",
        industry: "E-Commerce & Cloud Computing"
      });
    } else {
      if (recruiter.companyName !== "Amazon") {
        recruiter.companyName = "Amazon";
        await recruiter.save();
      }
    }

    console.log(`\nAmazon Recruiter Authenticated:`);
    console.log(`- Name: ${recruiter.name}`);
    console.log(`- Email: ${recruiter.email}`);
    console.log(`- Company: ${recruiter.companyName}`);
    console.log(`- ID: ${recruiter._id}`);

    // 2. Create/Update 15 Amazon Internships (Idempotent)
    const createdInternships = [];
    for (const data of amazonInternshipsData) {
      let item = await Internship.findOne({
        postedBy: recruiter._id,
        title: data.title
      });

      if (!item) {
        item = await Internship.create({
          ...data,
          company: recruiter.companyName || "Amazon",
          postedBy: recruiter._id
        });
      } else {
        item.company = recruiter.companyName || "Amazon";
        item.location = data.location;
        item.mode = data.mode;
        item.stipend = data.stipend;
        item.duration = data.duration;
        item.skills = data.skills;
        item.applyLink = data.applyLink;
        item.description = data.description;
        item.status = data.status;
        await item.save();
      }
      createdInternships.push(item);
    }

    console.log(`\nAmazon Internships Synced: ${createdInternships.length} postings active.`);

    // 3. Create/Update Student Users (Idempotent)
    const createdStudentsMap = new Map();
    const defaultPasswordHash = await bcrypt.hash("Password@123", 10);

    let newStudentsCount = 0;
    for (const studentData of amazonStudentsData) {
      let student = await User.findOne({ email: studentData.email });

      if (!student) {
        student = await User.create({
          ...studentData,
          password: defaultPasswordHash,
          role: "student"
        });
        newStudentsCount++;
      } else {
        student.name = studentData.name;
        student.college = studentData.college;
        student.degree = studentData.degree;
        student.branch = studentData.branch;
        student.year = studentData.year;
        student.skills = studentData.skills;
        student.concepts = studentData.concepts;
        student.goal = studentData.goal;
        student.bio = studentData.bio;
        student.projects = studentData.projects;
        student.codingProfiles = studentData.codingProfiles;
        student.role = "student";
        await student.save();
      }

      createdStudentsMap.set(studentData.email, student);
    }

    console.log(`Student Applicants Synced: ${createdStudentsMap.size} total student profiles active.`);

    // 4. Create/Update Application Records (Idempotent)
    let totalApplicationsCount = 0;
    let newApplicationsCount = 0;
    const statusCounts = {
      Applied: 0,
      Reviewing: 0,
      Shortlisted: 0,
      Rejected: 0
    };

    for (const mapping of applicationDistribution) {
      const student = createdStudentsMap.get(mapping.studentEmail);
      const internship = createdInternships[mapping.internshipIndex];

      if (!student || !internship) {
        console.warn(`Skipping invalid mapping for ${mapping.studentEmail}`);
        continue;
      }

      let application = await Application.findOne({
        student: student._id,
        internship: internship._id
      });

      if (!application) {
        application = await Application.create({
          student: student._id,
          internship: internship._id,
          recruiter: recruiter._id,
          status: mapping.status
        });
        newApplicationsCount++;
      } else {
        application.recruiter = recruiter._id;
        application.status = mapping.status;
        await application.save();
      }

      totalApplicationsCount++;
      if (statusCounts[mapping.status] !== undefined) {
        statusCounts[mapping.status]++;
      }
    }

    console.log("\n==========================================");
    console.log("   AMAZON DEMO DATA SEED COMPLETE         ");
    console.log("==========================================");
    console.log(`Database:                  ${dbName}`);
    console.log(`Recruiter:                 ${recruiter.name} (${recruiter.email})`);
    console.log(`Company:                   ${recruiter.companyName}`);
    console.log(`Total Internships:         ${createdInternships.length}`);
    console.log(`Total Student Applicants:  ${createdStudentsMap.size}`);
    console.log(`New Students Added:        ${newStudentsCount}`);
    console.log(`Total Applications:        ${totalApplicationsCount}`);
    console.log(`New Applications Created:  ${newApplicationsCount}`);
    console.log("------------------------------------------");
    console.log("Application Status Distribution:");
    console.log(`  - Applied:      ${statusCounts.Applied}`);
    console.log(`  - Reviewing:    ${statusCounts.Reviewing}`);
    console.log(`  - Shortlisted:  ${statusCounts.Shortlisted}`);
    console.log(`  - Rejected:     ${statusCounts.Rejected}`);
    console.log("==========================================");

    await mongoose.disconnect();
    console.log("Database disconnected successfully.");
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seedAmazonDemoData();
