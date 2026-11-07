# CampusCare - College Maintenance Management System

A modern, streamlined web application for college campuses allowing students, faculty, and administrators to report, manage, and track maintenance issues efficiently. Built with the **MERN** stack: **React 19**, **Vite 8**, **Tailwind CSS v4**, **Node.js**, **Express.js**, and **MongoDB** (via **Mongoose**).

---

## Tech Stack Overview

### Frontend
- **Framework**: [React 19](https://react.dev/) (`v19.3.1`) — Modern component-based UI with React Hooks (`useState`, `useEffect`, `useCallback`, `useContext`).
- **Build Tool & Dev Server**: [Vite 8](https://vitejs.dev/) (`v8.3.4`) — Ultra-fast ESM development server with Hot Module Replacement (HMR) and optimized Rollup production builds.
- **Styling & CSS**:
  - [Tailwind CSS v4](https://tailwindcss.com/) (`v4.3.3`) via `@tailwindcss/vite` — Modern, lightweight CSS-first utility framework.
  - **Custom Animations & Base Styles**: Minimal CSS keyframe animations (`fadeIn`, `modalZoom`), clean neutral color palette (`slate-50` background, subtle borders, high-contrast readable text), and custom scrollbars.
  - **Semantic Design**: Color-coded badges for status (`Submitted`, `Under Review`, `In Progress`, `Resolved`, `Rejected`) and priority levels (`Low`, `Medium`, `High`, `Emergency`).
- **State Management**:
  - **AuthContext**: Centralized authentication, JWT storage in `localStorage`, role switching, and session hydration.
  - **ToastContext**: Lightweight notification system for feedback (success, error, info) with auto-dismiss timers.
- **API Layer**: Native `fetch` API service module (`client/src/services/api.js`) with automatic JWT authorization header injection and error handling.
- **Proxy Configuration**: Vite reverse proxy forwarding `/api` and `/uploads` requests directly to the backend server.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+ recommended)
- **Web Framework**: [Express.js 5](https://expressjs.com/) (`v5.3.0`) — RESTful API routing, error handling, and middleware architecture.
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) (`mongoose@^8.x`) — Document-based database with schemas and models for `User`, `Complaint`, `ComplaintHistory`, `Notification`, `MaintenanceStaff`, and `Setting`. Auto-seeds demo accounts and complaints upon first connection.
- **Authentication & Security**:
  - [JSON Web Tokens (JWT)](https://jwt.io/) (`jsonwebtoken@^9.0.3`) — Secure token-based session management.
  - [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) (`bcryptjs@^3.0.3`) — Salted password hashing and verification.
  - [CORS](https://expressjs.com/en/resources/middleware/cors.html) (`cors@^2.8.6`) — Cross-Origin Resource Sharing support.
- **File Uploads**:
  - [Multer](https://github.com/expressjs/multer) (`multer@^2.5.0`) — Multipart form data handling with image MIME-type filtering and 10MB file size limits.
  - Static file serving for uploads via `/uploads`.
- **Environment Management**: [dotenv](https://github.com/motdotla/dotenv) (`dotenv@^18.0.9`) — Environment variable injection.
- **Process Orchestration**: [concurrently](https://github.com/open-cli-tools/concurrently) (`concurrently@^10.0.6`) — Runs backend and frontend development servers simultaneously.

---

## Features

- **Role-Based Portals**:
  - **Student & Faculty Portal**: File new maintenance tickets (with Category, Building, Floor, Room, Priority, Description, and photo upload), track active requests, and view resolution remarks.
  - **Admin Command Center**: Real-time overview of campus complaints, 4 metric cards (Total, New/Review, In Progress, Resolved), search and status filters, and instant status updates via inline dropdown.
- **One-Click Demo Access**: Instant pre-filled login buttons on the login screen for testing as **Student**, **Faculty**, or **Admin**.
- **Issue Tracking & Details**: Modal with complete complaint metadata, attached photo viewer, and status history timeline.
- **Clean, Responsive UI**: Lightweight, mobile-friendly interface with simple CSS and subtle animations.

---

## Project Structure

```text
├── client/                     # Frontend React application
│   ├── public/                 # Static assets (logo, favicon)
│   ├── src/
│   │   ├── assets/             # Images and branding assets
│   │   ├── components/
│   │   │   ├── auth/           # Login & registration forms
│   │   │   ├── common/         # Badges and UI utility components
│   │   │   ├── complaints/     # Complaint form and detail modals
│   │   │   ├── layout/         # Navigation header and footer
│   │   │   └── portals/        # UserPortal and AdminPortal views
│   │   ├── context/            # AuthContext & ToastContext providers
│   │   ├── services/           # Backend API integration layer
│   │   ├── constants.js        # Categories, buildings, priorities config
│   │   ├── index.css           # Tailwind CSS imports & basic animations
│   │   ├── main.jsx            # React root mount
│   │   └── App.jsx             # Main app container & routing logic
│   ├── index.html              # HTML entry template
│   ├── package.json            # Client dependencies and scripts
│   └── vite.config.js          # Vite configuration with proxy rules
│
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection & initial seeder
│   ├── models/                 # Mongoose schemas (User, Complaint, Notification, etc.)
│   ├── middleware/
│   │   └── auth.js             # JWT verification & role authorization
│   ├── routes/
│   │   ├── analytics.js        # Metric summaries and reporting
│   │   ├── auth.js             # Login, register, profile, and demo switch
│   │   ├── complaints.js       # CRUD operations for maintenance tickets
│   │   ├── export.js           # CSV/Excel export endpoints
│   │   ├── notifications.js    # In-app notifications
│   │   └── staff.js            # Maintenance staff assignments
│   └── index.js                # Express app entry, middleware & listener
│
├── uploads/                    # Uploaded image attachments
├── .env.example                # Sample environment configuration
├── package.json                # Root package configuration & dev scripts
└── README.md                   # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local MongoDB Community Server or MongoDB Atlas URI)
- **npm** (comes with Node.js)

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/rdg17128-eng/college-maintanance.git
   cd college-maintanance
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install client dependencies:
   ```bash
   npm install --prefix client
   ```

4. Create environment configuration file:
   ```bash
   cp .env.example .env
   ```

### Running Locally

Run both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Student** | `student@apexcollege.edu` | `student123` |
| **Faculty** | `faculty@apexcollege.edu` | `faculty123` |
| **Admin** | `admin@apexcollege.edu` | `admin123` |

*(Or click the Quick 1-Click Demo buttons on the sign-in screen for instant access)*

---

## Key API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `POST` | `/api/auth/register` | Register new student or faculty account | No |
| `GET` | `/api/auth/me` | Fetch current user profile & notifications | Yes |
| `GET` | `/api/complaints` | Fetch list of complaints (with optional filters) | Yes |
| `POST` | `/api/complaints` | Create a new maintenance complaint | Yes |
| `GET` | `/api/complaints/:id` | Fetch complaint details and activity history | Yes |
| `PATCH`| `/api/complaints/:id/status` | Update ticket status and remarks | Admin only |
| `POST` | `/api/upload` | Upload image attachment for complaints | Yes |
| `GET` | `/api/health` | Server health check | No |

---

## License

ISC
