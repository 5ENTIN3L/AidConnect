# AidConnect: NGO Aid Distribution Coordination System

AidConnect is a web-based platform designed to coordinate humanitarian aid distribution across multiple non-governmental organizations (NGOs). Built to address systemic coordination failures in aid delivery, the system provides a unified beneficiary registry, real-time duplication prevention, and end-to-end operational transparency.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Requirements](#system-requirements)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Non-Functional Requirements](#non-functional-requirements)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

Humanitarian aid distribution in East Africa, particularly Kenya, faces three systemic failures:

1. **Aid Duplication** — Beneficiaries receiving assistance from multiple organizations simultaneously, leading to misallocation of limited resources.
2. **Operational Silos** — Separate organizations maintain isolated datasets with no shared visibility, preventing effective coordination.
3. **Transparency Deficit** — The absence of an audit trail makes it impossible to verify whether aid reached intended recipients or to review distribution history.

These failures undermine the effectiveness of aid operations and erode trust in humanitarian programs.

---

## Solution Overview

AidConnect addresses these failures through three core pillars:

1. **Unified Beneficiary Registry** — A single, shared database of registered beneficiaries accessible to all participating organizations, eliminating siloed record-keeping.
2. **Real-Time Duplication Prevention Engine** — Automated cross-organization checks that flag duplicate aid requests within a configurable time window (default: 30 days).
3. **End-to-End Logistical Transparency** — A full audit trail from aid request creation through delivery confirmation, with real-time updates and role-appropriate reporting.

---

## Features

- **Authentication and Role-Based Access Control (RBAC)** — Secure login with granular permissions enforced per user role, covering read, write, approve, and delete operations.
- **Beneficiary Management** — Register, search, and manage beneficiary records with National ID-based deduplication.
- **Aid Request Lifecycle** — Create, review, approve, and track aid requests from submission to fulfillment.
- **Delivery Tracking** — Record and confirm deliveries with timestamped history.
- **Real-Time Duplication Detection** — Cross-organization checks triggered at request submission with visible warnings in the UI.
- **Live Data Updates** — WebSocket-powered real-time subscription to database changes using Appwrite Realtime.
- **Reporting and Analytics** — Role-appropriate dashboards with Chart.js visualizations of aid distribution metrics.
- **Responsive Interface** — Fully responsive design using Tailwind CSS, optimized for desktop and field-use mobile devices.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Create React App |
| Styling | Tailwind CSS, Framer Motion |
| Data Visualization | Chart.js |
| Backend-as-a-Service | Appwrite Cloud |
| Server | Node.js, Express |
| Database | Appwrite Database (aidconnect_db), PostgreSQL |
| Real-Time | Appwrite Realtime (WebSocket) |
| Authentication | Appwrite Account (email/password sessions) |
| Version Control | Git, GitHub |

---

## System Requirements

- Node.js 18 or later
- npm 9 or later
- An active Appwrite Cloud project
- Git

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/aidconnect.git
cd aidconnect
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in both the `server/` and `client/` directories. See the [Environment Variables](#environment-variables) section for required values.

### 5. Run the Development Server

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend (in a separate terminal):

```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`.

---

## Project Structure

```
aidconnect/
├── client/                        # React frontend application
│   ├── public/                    # Static assets
│   └── src/
│       ├── components/            # Reusable UI components
│       │   ├── DuplicationWarning.jsx
│       │   ├── NavBar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── config/
│       │   └── rbac.js            # Role-based access control configuration
│       ├── context/
│       │   └── AuthContext.jsx    # Authentication context and session management
│       ├── hooks/
│       │   ├── useRealtime.js     # Appwrite Realtime subscription hook
│       │   └── useRealtimeCollection.js
│       ├── pages/                 # Application page components
│       │   ├── AidRequests.jsx
│       │   ├── Beneficiaries.jsx
│       │   ├── BeneficiaryPortal.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Deliveries.jsx
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Reports.jsx
│       │   └── UnauthorizedPage.jsx
│       └── services/
│           ├── api.js             # Appwrite database operations
│           └── duplicationService.js  # Duplication detection logic
├── server/                        # Node.js/Express backend utilities
│   ├── index.js                   # Express server entry point
│   ├── setup_collections.js       # Database collection provisioning
│   └── functions/                 # Serverless function definitions
├── Docs/                          # Project documentation
└── README.md
```

---

## User Roles and Permissions

AidConnect implements five distinct roles with progressively scoped permissions:

| Role | Description |
|---|---|
| `superadmin` | Full system access, including user management, all data operations, and system configuration. |
| `ngoadmin` | Manages beneficiaries, aid requests, and deliveries within the organization. Can approve aid requests. |
| `fieldofficer` | Creates and submits aid requests and records deliveries. Read access to beneficiary data. |
| `viewer` | Read-only access to reports and dashboard data. No write permissions. |
| `beneficiary` | Access to the Beneficiary Portal to view personal aid history. |

---

## Environment Variables

### `client/.env`

```env
REACT_APP_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
REACT_APP_APPWRITE_PROJECT_ID=your_project_id
REACT_APP_APPWRITE_DATABASE_ID=aidconnect_db
REACT_APP_COLLECTION_BENEFICIARIES=beneficiaries
REACT_APP_COLLECTION_AID_REQUESTS=aid_requests
REACT_APP_COLLECTION_DELIVERIES=deliveries
```

### `server/.env`

```env
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_URL=postgresql://user:password@host:5432/aidconnect
```

---

## Available Scripts

### Client

| Script | Description |
|---|---|
| `npm start` | Starts the React development server at `http://localhost:3000`. |
| `npm run build` | Creates a production build in `client/build/`. |
| `npm test` | Runs the test suite using React Testing Library. |

### Server

| Script | Description |
|---|---|
| `npm run dev` | Starts the Express server with hot reload via nodemon. |
| `npm start` | Starts the Express server in production mode. |

---

## Non-Functional Requirements

- **Response Time** — All pages and API endpoints must respond within 3 seconds under normal network conditions.
- **Responsive Design** — The interface must function across desktop, tablet, and smartphone form factors.
- **Security** — All client-server communication is transmitted over HTTPS/TLS. Authentication is managed through Appwrite's session system.
- **Availability** — Target 99.9% uptime leveraging Appwrite Cloud's managed infrastructure, including automated backups.
- **Scalability** — The system architecture supports multiple concurrent organizations without performance degradation.
- **Maintainability** — The codebase follows modular design principles with separation of concerns across context, services, hooks, and pages.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes with descriptive messages following the format: `type: description` (e.g., `feat: add delivery confirmation modal`).
4. Push to your fork and open a pull request against `main`.
5. Ensure all existing tests pass before requesting a review.

---

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.
