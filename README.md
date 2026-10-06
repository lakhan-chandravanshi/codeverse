# Task Management REST API

A production-ready Task Management REST API built with Node.js, Express, MongoDB, and JWT authentication. This API allows users to register, login, and manage their own tasks with full CRUD operations.

## Features

- User authentication with JWT (JSON Web Tokens)
- Secure password hashing with bcryptjs
- Task CRUD operations (Create, Read, Update, Delete)
- User-specific task isolation (users can only access their own tasks)
- Input validation with Joi
- Pagination support for task listing
- Search and filter functionality
- Rate limiting on login endpoint
- Security middleware (Helmet, CORS)
- Centralized error handling
- Consistent JSON response format

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit

## Project Structure

```
.
├── src/
│   ├── config/
│   │   ├── index.js       # Environment configuration
│   │   └── db.js          # Database connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── taskController.js  # Task CRUD logic
│   ├── middlewares/
│   │   ├── auth.js        # JWT authentication middleware
│   │   └── errorHandler.js   # Centralized error handling
│   ├── models/
│   │   ├── User.js        # User schema
│   │   └── Task.js        # Task schema
│   ├── routes/
│   │   ├── authRoutes.js  # Authentication routes
│   │   └── taskRoutes.js  # Task routes
│   ├── validators/
│   │   ├── authValidator.js  # Auth validation schemas
│   │   └── taskValidator.js  # Task validation schemas
│   ├── utils/             # Utility functions
│   └── app.js             # Express app configuration
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── server.js              # Application entry point
└── README.md              # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Weather-Backend-
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

5. Start MongoDB:
```bash
# If using local MongoDB
mongod

# Or using MongoDB Atlas, update MONGODB_URI in .env
```

6. Run the application:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Description**: Register a new user
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
- **POST** `/api/auth/login`
- **Description**: Login with email and password
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
- **GET** `/api/auth/me`
- **Description**: Get authenticated user's profile
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Task Endpoints

All task endpoints require authentication. Include the JWT token in the Authorization header:
`Authorization: Bearer <token>`

#### Create Task
- **POST** `/api/tasks`
- **Description**: Create a new task
- **Request Body**:
```json
{
  "title": "Complete API task",
  "description": "Build the task management API",
  "priority": "high",
  "status": "pending",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```
- **Response** (201):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "64f...",
    "title": "Complete API task",
    "description": "Build the task management API",
    "priority": "high",
    "status": "pending",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "user": "64f...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### List Tasks
- **GET** `/api/tasks`
- **Description**: Get all tasks for the authenticated user with pagination and filters
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (pending, in-progress, completed)
  - `search` (optional): Search in task titles
- **Example**: `GET /api/tasks?page=1&limit=10&status=pending&search=api`
- **Response** (200):
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": "64f...",
        "title": "Complete API task",
        "description": "Build the task management API",
        "priority": "high",
        "status": "pending",
        "dueDate": "2024-12-31T23:59:59.000Z",
        "user": "64f...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Get Task by ID
- **GET** `/api/tasks/:id`
- **Description**: Get a specific task by ID
- **Response** (200):
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "64f...",
    "title": "Complete API task",
    "description": "Build the task management API",
    "priority": "high",
    "status": "pending",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "user": "64f...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Task
- **PUT** `/api/tasks/:id` or **PATCH** `/api/tasks/:id`
- **Description**: Update a task (all fields optional)
- **Request Body**:
```json
{
  "title": "Updated task title",
  "status": "in-progress",
  "priority": "medium"
}
```
- **Response** (200):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "64f...",
    "title": "Updated task title",
    "description": "Build the task management API",
    "priority": "medium",
    "status": "in-progress",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "user": "64f...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Delete Task
- **DELETE** `/api/tasks/:id`
- **Description**: Delete a task
- **Response** (200):
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": "64f..."
  }
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (accessing another user's resource)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs before storage
2. **JWT Authentication**: Secure token-based authentication with configurable expiration
3. **Rate Limiting**: Login endpoint is rate-limited to prevent brute force attacks
4. **CORS**: Configured CORS for cross-origin requests
5. **Helmet**: Security headers for Express applications
6. **Input Validation**: All inputs are validated using Joi schemas
7. **User Isolation**: Users can only access their own tasks
8. **Environment Variables**: Sensitive data stored in environment variables
9. **No Password in Response**: Password field is excluded from all API responses

## Database Schema

### User Schema
- `name`: String (required, max 50 characters)
- `email`: String (required, unique, validated format)
- `password`: String (required, hashed, min 6 characters)
- `role`: String (enum: 'user', 'admin', default: 'user')
- `createdAt`: Date (auto-generated)

### Task Schema
- `title`: String (required, max 100 characters)
- `description`: String (optional, max 500 characters)
- `priority`: String (enum: 'low', 'medium', 'high', default: 'medium')
- `status`: String (enum: 'pending', 'in-progress', 'completed', default: 'pending')
- `dueDate`: Date (optional)
- `user`: ObjectId (required, reference to User)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-updated)

## Postman Collection

A Postman collection is included in the repository at `postman-collection.json`. Import this file into Postman to test all API endpoints with pre-configured requests.

## Testing with Postman

1. Import the Postman collection
2. Set up an environment variable for `baseUrl` (e.g., `http://localhost:5000`)
3. Start by registering a new user
4. Copy the token from the register/login response
5. Set the token as an environment variable or include it in the Authorization header
6. Test the task endpoints

## Design Decisions

See `DESIGN_DECISIONS.md` for detailed explanations of important architectural and security decisions.

## License

ISC

## Author

Task Management API - Technical Assignment
