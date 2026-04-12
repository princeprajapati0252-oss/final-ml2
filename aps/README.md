# Automated Parking System

A full-stack web application for managing parking spaces with user booking capabilities and admin management features.

## 🚀 Tech Stack

- **Frontend**: React with Vite
- **Backend**: Python Flask (REST API)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Features

### User Management
- **Three User Roles**:
  - **Super Admin**: Manages admin accounts
  - **Admin**: Adds and manages parking spots/floors
  - **End User**: Books parking slots
- User registration and secure login

### Parking Management
- Add and manage multiple parking floors
- Create and configure parking slots per floor
- Set different pricing for different floors

### Booking System
- View available parking slots in real-time
- Book slots for specific time durations
- Automatic pricing calculation based on duration

### Billing System
- Automatically calculate charges based on time spent
- Generate invoices and receipts for bookings

## 🗂️ Project Structure

```
project_by_ai/
├── backend/          # Flask REST API
├── frontend/         # React application
├── database/         # Database schema and setup scripts
└── README.md         # Project documentation
```

## 🛠️ Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

## 🚀 Setup Instructions

### 1. Database Setup

First, create the PostgreSQL database:

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE parking_system;

# Create a user (optional)
CREATE USER parking_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE parking_system TO parking_admin;

# Exit PostgreSQL
\q
```

Run the schema setup:

```bash
# Navigate to database directory
cd database

# Run the schema file
psql -U parking_admin -d parking_system -f schema.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# venv\Scripts\activate   # On Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export DATABASE_URL=postgresql://parking_admin:your_password@localhost:5432/parking_system
export JWT_SECRET_KEY=your_secret_key_here

# Run the Flask server
flask run
```

The backend API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Management (Super Admin)
- `GET /api/users` - Get all users
- `POST /api/users/admin` - Create admin account
- `DELETE /api/users/:id` - Delete user

### Parking Management (Admin)
- `POST /api/floors` - Add new parking floor
- `GET /api/floors` - Get all floors
- `PUT /api/floors/:id` - Update floor details
- `DELETE /api/floors/:id` - Delete floor

### Slot Management (Admin)
- `POST /api/slots` - Create parking slot
- `GET /api/slots` - Get all slots
- `PUT /api/slots/:id` - Update slot
- `DELETE /api/slots/:id` - Delete slot

### Booking System (End User)
- `GET /api/slots/available` - View available slots
- `POST /api/bookings` - Book a parking slot
- `GET /api/bookings/user/:userId` - Get user bookings
- `PUT /api/bookings/:id/end` - End booking

### Billing
- `GET /api/invoices/:bookingId` - Get invoice for booking

## 🔐 User Roles & Permissions

| Feature | Super Admin | Admin | End User |
|---------|-------------|-------|----------|
| Manage Admins | ✅ | ❌ | ❌ |
| Add/Edit Floors | ❌ | ✅ | ❌ |
| Add/Edit Slots | ❌ | ✅ | ❌ |
| Book Slots | ❌ | ❌ | ✅ |
| View Bookings | ✅ | ✅ | ✅ (own) |
| Generate Invoices | ✅ | ✅ | ✅ (own) |

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/parking_system
JWT_SECRET_KEY=your_secret_key
FLASK_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name

## 🐛 Known Issues

None at the moment. Please report issues to the issue tracker.

## 📞 Support

For support, email support@parkingsystem.com or open an issue in the repository.
