# PLACIFY – Intelligent Placement Preparation & Tracking Platform

Placify is a modern, web-based placement management, preparation, and automated tracking platform designed for B.Tech students and college placement administrators.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), JavaScript, HTML5, Vanilla CSS Design System
- **Backend**: Java (JDK 17/21/22), Spring Boot 3.3.4, RESTful APIs, Spring Security
- **Database**: MongoDB (Local instance on port 27017, database: `placify_db`)
- **Authentication**: Stateless JWT with BCrypt password hashing
- **AI Integration**: Google Gemini API (Configured strictly on backend)

---

## 📁 Repository Structure

```
Placify/
├── backend/                  # Spring Boot 3.x REST API (Maven)
│   ├── mvnw.cmd              # Maven wrapper for Windows
│   ├── pom.xml               # Backend dependencies & build config
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/placify/api/
│   │   │   │   ├── PlacifyApplication.java
│   │   │   │   ├── config/       # WebMvc CORS, Security, MongoDB config
│   │   │   │   ├── controller/   # REST API Controllers (/api/health, /api/status)
│   │   │   │   ├── dto/          # Request & Response Data Transfer Objects
│   │   │   │   ├── exception/    # Custom exception classes & handlers
│   │   │   │   ├── model/        # MongoDB entity models (User, Profile, Drive, etc.)
│   │   │   │   ├── repository/   # Spring Data MongoDB repositories
│   │   │   │   ├── security/     # JWT Token Provider, Filters, UserDetails
│   │   │   │   ├── service/      # Business logic & Eligibility engine
│   │   │   │   └── util/         # PDF parser, Prompts, Rule evaluators
│   │   │   └── resources/
│   │   │       └── application.properties # App configuration, ports, Mongo URI
│   └── uploads/              # Local storage for resumes and preparation PDFs
│
├── frontend/                 # React.js SPA (Vite)
│   ├── package.json          # Frontend dependencies (React, Router, Axios, Lucide)
│   ├── vite.config.js        # Vite configuration
│   ├── index.html            # Main HTML with modern typography
│   └── src/
│       ├── App.jsx           # Root application component & routing
│       ├── main.jsx          # Entry point
│       ├── assets/           # Logos and media assets
│       ├── components/       # Reusable UI components (Header, Footer, Card, Button, Badge)
│       ├── context/          # Global AuthContext & state providers
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Dashboard & Public layout shells
│       ├── pages/            # Student, Admin & Auth view pages
│       ├── services/         # Centralized Axios API client (api.js)
│       ├── styles/           # CSS design system (tokens, layout, components)
│       └── utils/            # Constants (Roles, Statuses, Branches)
│
└── README.md
```

---

## 🚀 Running the Project

### Prerequisites
1. **Java JDK 17+** (JDK 22 is tested and compatible)
2. **Node.js 18+** & **npm**
3. **MongoDB** running locally on default port `27017`

---

### 1. Start MongoDB
Ensure MongoDB service is running:
```powershell
# If using Windows Service:
Start-Service MongoDB

# Or run mongod directly:
mongod --dbpath "D:\MongoDB\data"
```

---

### 2. Run Backend (Spring Boot)
Open a terminal in the project root:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
- **API URL**: `http://localhost:8080`
- **Health Check**: `http://localhost:8080/api/health`
- **System Status**: `http://localhost:8080/api/status`

---

### 3. Run Frontend (React.js + Vite)
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
- **Frontend URL**: `http://localhost:5173`

---

## 👥 Supported Roles
- **STUDENT**: Profile management, company drives, automated eligibility check, 1-click application, recruitment funnel tracker, preparation hub, AI resume analyzer.
- **ADMIN**: Student directory & search, company drive creation with eligibility criteria, application status updates, resource management, institutional placement statistics.
