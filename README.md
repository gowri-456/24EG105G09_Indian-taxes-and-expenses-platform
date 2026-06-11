# Indian Tax & Expense Planner

Indian Tax & Expense Planner is a beginner-friendly full-stack MERN-style project for tracking income, expenses, budgets, tax estimates, reports, and user/admin dashboards.

## Project Overview

The project is divided into two main parts:

```text
tax-exp/
  frontend/   React + Vite user interface
  backend/    Express + MongoDB API
```

## Tech Stack

Frontend:

- React
- Vite
- React Router
- React Icons
- React Hot Toast

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Features

- User registration and login
- Protected dashboard
- Income management
- Expense management
- Budget planner
- Tax calculator
- Reports page
- User profile page
- AI advisor page
- Admin dashboard
- Admin users page
- Admin analytics page

## Local Setup

Clone or open the project folder, then install dependencies separately for frontend and backend.

Backend setup:

```bash
cd backend
npm install
```

Create a backend `.env` file:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start backend:

```bash
node server.js
```

Or use nodemon:

```bash
npx nodemon server.js
```

Frontend setup:

```bash
cd frontend
npm install
npm run dev
```

Default local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
API:      http://localhost:5000/api
```

## Important Configuration

The frontend API client currently uses:

```text
http://localhost:5000/api
```

Before deployment, update `frontend/src/services/apiClient.js` to use your deployed backend URL.

The backend CORS setting uses `CLIENT_URL`, so set it to your deployed frontend URL in production.

## Deployment Plan

Recommended beginner deployment:

- Database: MongoDB Atlas
- Backend: Render or Railway
- Frontend: Vercel or Netlify

Deploy in this order:

1. Create MongoDB Atlas database.
2. Deploy backend and add environment variables.
3. Update frontend API URL to deployed backend.
4. Deploy frontend.
5. Test register, login, dashboard, income, and expenses on the live site.

## Project Status

This project is suitable as a beginner full-stack portfolio project. Before final submission or deployment, test the full user flow:

```text
Register -> Login -> Dashboard -> Add Income -> Add Expense -> Reports -> Logout
```

## Separate Documentation

More specific setup notes are available here:

- `frontend/README.md`
- `backend/README.md`

