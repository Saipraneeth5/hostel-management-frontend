# HostelHub — Frontend

React-based frontend for the Hostel Management System.

## Tech Stack

- React 18 + React Router v6
- Axios (API calls with JWT interceptor)
- Recharts (dashboard charts)
- react-hot-toast (notifications)
- DM Serif Display + DM Sans (typography)

## Project Structure

```
src/
├── api/              # Axios instance + all API modules
├── components/
│   ├── common/       # Reusable UI: Card, Button, Table, Modal, Badge…
│   └── layout/       # AppLayout (sidebar + header)
├── context/          # AuthContext (login, logout, role checks)
├── pages/
│   ├── auth/         # LoginPage, RegisterPage
│   ├── admin/        # Dashboard, Students, Rooms, Complaints, Payments, Mess, Notifications
│   └── student/      # Dashboard, Profile, Complaints, Payments, Mess, Notifications
└── utils/            # Helpers
```

## Setup & Run

### Prerequisites
- Node.js >= 16
- Backend running on `http://localhost:8080`

### Install & Start

```bash
npm install
npm start
```

The frontend runs on `http://localhost:3000` and proxies all `/api/*`
requests to `http://localhost:8080` (configured in `package.json`).

### Build for Production

```bash
npm run build
```

## Roles & Access

| Role    | Access                                                         |
|---------|----------------------------------------------------------------|
| ADMIN   | Full access — all pages including deletes                      |
| WARDEN  | Manage students, rooms, complaints, payments, notifications    |
| STUDENT | Own profile, complaints, payments, mess menu, notifications    |

## Default Credentials (from seed data)

| Username | Password   | Role    |
|----------|------------|---------|
| admin    | admin123   | ADMIN   |
| warden   | warden123  | WARDEN  |

## API Endpoints Used

| Module        | Base URL             |
|---------------|----------------------|
| Auth          | `/api/auth`          |
| Students      | `/api/students`      |
| Rooms         | `/api/rooms`         |
| Complaints    | `/api/complaints`    |
| Payments      | `/api/payments`      |
| Mess Menu     | `/api/mess`          |
| Notifications | `/api/notifications` |
