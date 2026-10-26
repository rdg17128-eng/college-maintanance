# CampusCare - College Maintenance Management System

A streamlined, modern web application for college campuses allowing students, faculty, and administrators to report, manage, and track maintenance issues efficiently.

## Features

- **Simple & Intuitive UI**: Clean, uncluttered design focused on speed, clarity, and ease of use.
- **Role-Based Portals**:
  - **Student / Faculty Portal**: Quick complaint filing (Category, Building, Room, Floor, Priority, Description, and photo upload), personal ticket dashboard, and status tracking.
  - **Admin Portal**: Complete overview of all campus tickets, live metric cards, search & status filters, and instant status updates (Submitted → In Progress → Resolved).
- **One-Click Demo Access**: Instant pre-filled logins for testing as Student, Faculty, or Admin.
- **Issue Tracking & Details**: Modal with complaint metadata, attached photos, and timeline history.
- **RESTful API**: Node.js & Express backend with SQLite persistence and file upload support.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons
- **Backend**: Node.js, Express, SQLite3, Multer, JWT, BcryptJS

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

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

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

### Running Locally

Run both server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Student** | student@apexcollege.edu | student123 |
| **Faculty** | faculty@apexcollege.edu | faculty123 |
| **Admin** | admin@apexcollege.edu | admin123 |

*(Or click the Quick Demo buttons on the login screen for 1-click access)*

## License

ISC
