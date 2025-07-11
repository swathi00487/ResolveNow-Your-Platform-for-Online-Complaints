# Complaint Registry System

A full-stack web application for managing customer complaints with role-based access control.

## Features

### Customer Features
- Register and login with email/password
- Create and submit complaints
- View complaint status and history
- Chat with assigned agents
- Update profile information

### Agent Features
- Login and manage assigned complaints
- Update complaint status
- Chat with customers
- View complaint details and history

### Admin Features
- Manage all users and agents
- Assign complaints to agents
- View system statistics and dashboard
- Monitor complaint status
- Bulk operations

## Technology Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

### Frontend
- React.js with React Router
- Bootstrap 5 for styling
- Material-UI components
- Axios for API calls
- Webpack for bundling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/complaint-registry
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Complaints
- `GET /api/complaints` - Get all complaints (role-based)
- `POST /api/complaints` - Create new complaint (customer only)
- `GET /api/complaints/:id` - Get complaint details
- `PATCH /api/complaints/:id/status` - Update complaint status
- `PATCH /api/complaints/:id/assign` - Assign complaint to agent (admin only)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/complaint/:complaintId` - Get messages for complaint
- `PATCH /api/messages/:messageId/read` - Mark message as read

### Admin
- `GET /api/admin/dashboard` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/agents` - Get all agents
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## User Roles

### Customer
- Can create complaints
- View their own complaints
- Chat with assigned agents
- Update profile

### Agent
- View assigned complaints
- Update complaint status
- Chat with customers
- View complaint details

### Admin
- Full system access
- Manage users and agents
- Assign complaints
- View all statistics
- Monitor system

## Database Schema

### User
- name, email, password, role
- phone, address, isActive
- createdAt

### Complaint
- title, description, category, priority
- status, customer, assignedAgent
- assignedBy, assignedAt, resolvedAt
- resolution, attachments

### Message
- complaint, sender, receiver
- content, messageType, fileUrl
- isRead, readAt, createdAt

## Usage

1. Start both backend and frontend servers
2. Register as a customer, agent, or admin
3. Login with your credentials
4. Navigate through the application based on your role

## Default Admin Account

To create an admin account, register normally and then manually update the role in the database to "admin".

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection

## Deployment

### Backend
- Set up MongoDB (MongoDB Atlas recommended)
- Configure environment variables
- Deploy to Heroku, Vercel, or similar

### Frontend
- Build the application: `npm run build`
- Deploy to Netlify, Vercel, or similar
- Update API base URL in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License. 