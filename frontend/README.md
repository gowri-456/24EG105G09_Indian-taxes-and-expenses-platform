# Frontend README

This is the React frontend for the Indian Tax & Expense Planner project. It provides the user interface for authentication, dashboard summaries, income tracking, expense tracking, budget planning, tax calculation, reports, profile management, AI advisor, and admin pages.

## Tech Stack

- React
- Vite
- React Router
- React Icons
- React Hot Toast
- ESLint

## Main Features

- Home, login, and register pages
- Protected user dashboard
- Income and expense pages
- Add income and add expense forms
- Budget planner
- Tax calculator
- Reports page
- Profile page
- AI advisor page
- Admin dashboard, users, and analytics pages
- Shared navbar, sidebar, and footer layout

## Folder Structure

```text
frontend/
  public/
  src/
    components/
    hooks/
    pages/
    services/
  index.html
  package.json
  vite.config.js
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint checks.

## API Configuration

The frontend API client currently points to:

```text
http://localhost:5000/api
```

For deployment, update the API base URL in:

```text
src/services/apiClient.js
```

Change it from the local backend URL to your deployed backend URL.

Example:

```js
const BASE_URL = "https://your-backend-url.com/api";
```

## Deployment

You can deploy this frontend on:

- Vercel
- Netlify
- Render Static Site

Before deploying, make sure:

- The backend is already deployed.
- The API base URL points to the deployed backend.
- The backend CORS setting allows your deployed frontend URL.

