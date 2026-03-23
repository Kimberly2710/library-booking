# 📚 Library Booking System

A full stack Library Management System that allows students to browse 
and borrow books online, and administrators to manage the entire 
library digitally — no paperwork needed.

---

## 🌍 What This System Does

This system replaces the traditional manual library process with a 
fast, secure and easy to use digital platform.

**As a Student you can:**
- Create an account and log in
- Browse all available books
- Borrow a book with one click
- See your borrowing history and due dates

**As an Admin (Librarian) you can:**
- Add and delete books from the catalogue
- View and manage all student members
- See all active, returned and overdue reservations
- Mark books as returned when students bring them back

---

## 🖥️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Tailwind CSS | What the user sees |
| Backend | Node.js + Express | Handles all logic |
| Database | MySQL | Stores all data |
| Auth | JWT + Bcrypt | Security and login |
| Architecture | MVC Pattern | Code organization |
| API Testing | Postman | Test all endpoints |

---

## 📁 Project Structure
```
library-booking/
├── backend/
│   ├── config/         ← Database connection
│   ├── controllers/    ← Business logic
│   ├── middleware/     ← Auth and error handling
│   ├── models/         ← Database queries
│   ├── routes/         ← API endpoints
│   └── server.js       ← Entry point
└── frontend/
    └── src/
        ├── components/ ← Navbar, ProtectedRoute
        ├── context/    ← Auth state management
        ├── pages/      ← Login, Dashboard, Books etc
        └── services/   ← API calls
```

---

## ⚙️ Setup Instructions (For Developers)

### What You Need Installed First
- [Node.js](https://nodejs.org) — version 18 or higher
- [XAMPP](https://www.apachefriends.org) — for MySQL database
- [Git](https://git-scm.com) — to clone the project
- [Postman](https://www.postman.com) — optional, for API testing

---

### Step 1 — Clone the Project
```bash
git clone https://github.com/Kimberly2710/library-booking.git
cd library-booking
```

---

### Step 2 — Set Up the Database

1. Open XAMPP and start **Apache** and **MySQL**
2. Open your browser and go to `http://localhost/phpmyadmin`
3. Click **New** on the left sidebar
4. Create a database named exactly: `library_booking`
5. Click on `library_booking` then click the **SQL** tab
6. Copy and paste the SQL below and click **Go**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'member') DEFAULT 'member',
  membership_type ENUM('standard', 'premium') DEFAULT 'standard',
  status ENUM('active', 'suspended', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150) NOT NULL,
  isbn VARCHAR(20) NOT NULL UNIQUE,
  genre VARCHAR(50),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_copies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  copy_code VARCHAR(50) NOT NULL UNIQUE,
  `condition` ENUM('new', 'good', 'fair', 'poor') DEFAULT 'good',
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  copy_id INT NOT NULL,
  borrowed_date DATE NOT NULL,
  due_date DATE NOT NULL,
  returned_date DATE NULL,
  status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (copy_id) REFERENCES book_copies(id)
);

CREATE TABLE fines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  amount DECIMAL(8,2) DEFAULT 0.00,
  status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@library.com',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'admin');
```

---

### Step 3 — Set Up the Backend
```bash
cd backend
npm install
```

Create a file called `.env` inside the backend folder and paste this:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=library_booking
DB_PORT=3306
JWT_SECRET=library_super_secret_key_2026
JWT_EXPIRES_IN=24h
PORT=5000
```

Then start the backend server:
```bash
npm run dev
```

You should see:
```
Server running on http://localhost:5000
```

---

### Step 4 — Set Up the Frontend

Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE ready on http://localhost:5173
```

---

### Step 5 — Open the App

Open your browser and go to:
```
http://localhost:5173
```

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | admin123 |

To create a student account click **"Create an account"** on the login page.

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/v1/auth/register | Register new member | No |
| POST | /api/v1/auth/login | Login | No |
| GET | /api/v1/auth/me | Get current user | Yes |
| GET | /api/v1/books | Get all books | No |
| POST | /api/v1/books | Add a book | Admin only |
| GET | /api/v1/books/:id | Get single book | No |
| PUT | /api/v1/books/:id | Update book | Admin only |
| DELETE | /api/v1/books/:id | Delete book | Admin only |
| GET | /api/v1/members | Get all members | Admin only |
| GET | /api/v1/members/:id | Get single member | Yes |
| PATCH | /api/v1/members/:id/status | Update member status | Admin only |
| GET | /api/v1/reservations | Get all reservations | Yes |
| POST | /api/v1/reservations | Create reservation | Yes |
| PATCH | /api/v1/reservations/:id/return | Return a book | Yes |

---

## 🔄 How the System Works
```
Student registers → logs in → gets JWT token
         ↓
Browses books → clicks Borrow → selects duration
         ↓
System checks: book available? member has no overdue?
         ↓
Reservation created → copy marked unavailable
         ↓
Student returns book → admin clicks Return
         ↓
Copy available again → available count increases
```

---

## 👥 Built By

Kimberly Jahenda — Full Stack Developer

---

## 📌 Notes

- Make sure XAMPP MySQL and Apache are running before starting the backend
- Both backend and frontend servers must run at the same time
- The `.env` file is not included in GitHub for security reasons
  — you must create it yourself following Step 3
- Default admin password is `admin123`