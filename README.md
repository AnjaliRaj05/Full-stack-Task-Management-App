# Full-stack-Task-Management-App

A smart, full-stack task management platform designed to help you stay in 
control. Track progress, manage priorities, collaborate effortlessly, and 
complete tasks faster with a clean and intuitive workflow.

## 🎯 Project Overview
<img width="1885" height="867" alt="image" src="https://github.com/user-attachments/assets/90eaabcd-a498-4c09-8a69-c54f2cd5e755" />

<p align="center">
  <img src="https://github.com/user-attachments/assets/8f4ea3fe-3644-4a60-8aa8-4ea1df412795" width="300" />
  <img src="https://github.com/user-attachments/assets/e86575c7-728e-4852-ac18-d7ad8778366b" width="300" />
  <img src="https://github.com/user-attachments/assets/50e8beb1-f1be-4da4-ae45-7a76e57a682d" width="300" />

</p>


## 🏗️ Architecture & Tech Stack

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MONGODB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, CORS

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **State Management**: React  useEffect Context API
## 📋 Features

### Backend Features
✅ **Architecture**: MVC pattern 
✅ **Business Logic**: All requirements implemented with validation
✅ **Authentication & Authorization**: JWT-based with role-based access control
✅ **Error Handling**: Centralized error middleware
✅ **Database**: MONGODB
✅ **Security**: CORS, password hashing

### Frontend Features
✅ **Modern UI**: Light and Dark Theme
✅ **Responsive Design**: Mobile-first approach
✅ **Authentication**: Login, Register, Protected Routes
✅ **Dashboard**: Role-based views for Admin and users
✅ **Task Management for users**: Create, update
✅ **Real-time Updates**: Automatic refresh after actions
✅ **Error Handling**: User-friendly error messages
✅ **Loading States**: Loding Spinners 


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
   
   Frontend will run on `http://localhost:5173`

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

## 🔐 Project userflow

### 1. Task Creation
- Any user and admin can create a task
- Every task is linked to the user who created it (createdBy).
- Tasks are created with a default status of pending.

### 2. Task Viewing Permissions
- **Users** 
- Can view only their own tasks.
- No access to other users' tasks.
- **Admin**
-  can view all tasks created by every user.
-  Has complete visibility across the system.

### 3. Task Update Rules
- Only the user who created the task can update it.
(Title, description, or status can be updated—except deletion.)

- Admins cannot update tasks created by users.

### 4. Task Deletion Rules
- Only Admin has the authority to delete tasks.
- Users cannot delete any task (not even their own).

## 📁 Project Structure

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
t" to complete it

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS**: Configured for frontend origin
- **Role-Based Access Control**: Middleware authorization


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
