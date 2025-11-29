# Full-stack-Task-Management-App
## Project Deployed Link: [https://lambent-granita-2ed3c2.netlify.app/]
A smart, full-stack task management platform designed to help you stay in 
control. Track progress, manage priorities, collaborate effortlessly, and 
complete tasks faster with a clean and intuitive workflow.

##  Project Overview
<img width="1885" height="867" alt="image" src="https://github.com/user-attachments/assets/90eaabcd-a498-4c09-8a69-c54f2cd5e755" />

<p align="center">
  <img width="1116" height="838" alt="image" src="https://github.com/user-attachments/assets/5db8a776-2913-41e5-8aac-285b79841c30" />
  <img src="https://github.com/user-attachments/assets/e86575c7-728e-4852-ac18-d7ad8778366b" width="300" />
  <img src="https://github.com/user-attachments/assets/50e8beb1-f1be-4da4-ae45-7a76e57a682d" width="300" />

</p>


##  Tech Stack

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MONGODB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, CORS
- **Centralized Error Middleware**: Consistent error responses
  
### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6 Client-side routing
- **HTTP Client**: Axios with interceptors
- **State Management**: React  useEffect Context API
- **Lucide React** - Modern icon library
## Features

### Authentication & Security
- JWT-based authentication with secure token management
- Role-based access control (Admin & User roles)
- Password hashing with bcrypt
- Protected routes and API endpoints
- CORS configuration for secure cross-origin requests

### Frontend Features
- UI Design: Clean, intuitive interface with smooth animations
- Theme Support: Toggle between Light and Dark themes
- Responsive Design: Mobile-first approach, works seamlessly on all devices
- Real-time Updates: Automatic refresh after task operations
- Loading States: Professional loading spinners for better UX
- Error Handling: User-friendly error messages and validation feedback

##  Task Management project userflow

### 1. Task Creation
- Any user and admin can create a task
- Every task is linked to the user who created it (createdBy).
- Tasks are created with a default status of pending.

### 2. Task Viewing Permissions
**For Users** 
- Create new tasks with title, description, and priority.
- Update task status and details
- View personal task dashboard

**For Admin**
-  View all users' tasks
-  Manage users and tasks across the system
-  Role-based dashboard views.

### Prerequisites
- Node.js 
- MongoDB
- npm 

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your MongoDB string credentials:
   ```env
   DATABASE_URL=""
   JWT_SECRET=""
   PORT=
   ```
4. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:Your-PORT`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   

## 📊 Database Schema

### User Table
- `id` (ObjectId, Primary Key)
- `fullname` (String)
- `email` (Unique)
- `password` (String, Hashed)
- `role` (user | admin)
- `createdAt`(Timestamp)
- `updatedAt`(Timestamp)

### Task Table
- `id` (ObjectId, Primary Key)
- `title` (String)
- `description`(String)
- `status` (pending | completed)
- `createdById` (Foreign Key to UserID)
- `createdAt`(Timestamp)
- `updatedAt`(Timestamp)


## 📁 Directory Structure

```
request-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, 
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation,
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── server.js        # Express app setup
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
|   |   |__ styles/          # css styling
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Main entry point
│   │   └── index.css        # Global styles
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```
" to complete it

## Backend Architecture
- MVC Pattern: Clean separation of concerns
- Business Logic: Complete validation and error handling
- Centralized Error Middleware: Consistent error responses
- MongoDB Integration: Efficient NoSQL database operations
- RESTful API: Well-structured endpoint

### Backend Development
```bash
cd backend
npm run dev 
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server
```


**Built with ❤️ using Node.js, Express, MongoDB, React, and Vite**
