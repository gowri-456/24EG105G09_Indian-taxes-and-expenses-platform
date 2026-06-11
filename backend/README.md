# Backend README

This is the Express backend API for the Indian Tax & Expense Planner project. It handles authentication, protected user data, income, expenses, tax calculation, budget planning, admin routes, and MongoDB database connection.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- express-validator
- dotenv
- CORS

## Main Features

- User registration and login
- JWT-based protected routes
- Expense APIs
- Income APIs
- Tax APIs
- Budget APIs
- Admin APIs
- Global error handling
- MongoDB connection with Mongoose
- Health check endpoint

## Folder Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js
  package.json
```

## Environment Variables

Create a `.env` file inside the `backend/` folder.

Example:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Important variables:

- `PORT`: Backend server port.
- `MONGO_URL`: MongoDB connection string.
- `JWT_SECRET`: Secret key used to sign JWT tokens.
- `JWT_EXPIRES_IN`: Token expiry time.
- `CLIENT_URL`: Frontend URL allowed by CORS.
- `NODE_ENV`: App environment.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
node server.js
```

For development with auto-restart:

```bash
npx nodemon server.js
```

The backend usually runs at:

```text
http://localhost:5000
```

## API Routes

Base API URL:

```text
http://localhost:5000/api
```

Main route groups:

```text
/api/auth
/api/expenses
/api/income
/api/tax
/api/budget
/api/admin
```

Health check:

```text
GET /api/health
```

## API Test Files

This project includes `.http` files that can be used to test APIs from an editor like VS Code with a REST Client extension:

```text
auth.http
budget.http
expense.http
income.http
tax.http
```

## Deployment

You can deploy this backend on:

- Render
- Railway
- Cyclic
- Any Node.js hosting provider

Before deploying, make sure:

- MongoDB Atlas or another hosted MongoDB database is ready.
- Production environment variables are added in the hosting dashboard.
- `CLIENT_URL` is set to your deployed frontend URL.
- Your frontend API base URL points to this deployed backend.

