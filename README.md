# 📦 Business Management Web Application

A full-stack web application designed for **managing accounting, inventory, customers, employees, investments, and more**. Built with modern technologies and follows industrial best practices for scalability, security, and maintainability.

---

## 🚀 Features

✅ **User Authentication**
- Sign Up, Login, Logout  
- Password Reset (Forgot Password)  
- Role-based Access Control (Admin, Employees, etc.)  
- JWT / HTTP-only Cookies for secure session management  

✅ **Accounting Management**
- Track income, expenses, and net profit
- Generate and send invoices (PDF)
- Automatic email notifications for due payments

✅ **Inventory Management**
- Add, update, and manage stock levels
- Low-stock alerts via email

✅ **Customer Management**
- CRUD operations for customer data
- Send weekly payment reminders automatically

✅ **Employee & Attendance Management**
- Add employees and assign them to companies
- Track attendance with check-in/check-out functionality
- View attendance dashboards and analytics

✅ **Investment Tracking**
- Manage investments with client details and transaction history
- Categorize investments for quick insights

✅ **Activity Summary**
- View a summary of all system activities
- Audit logs for better traceability

✅ **🛡 Security Features**
- Passwords hashed with bcrypt
- Secure cookie storage for JWT
- Rate limiting and input validation to prevent abuse
- CORS and Helmet for backend hardening

✅ **Payment Gateway Integration**
- Integrated eSewa for secure online transactions

---

## 🛠️ Tech Stack

| Category           | Technology                |
|--------------------|----------------------------|
| **Frontend**       | React.js (Vite)            |
| **Backend**        | Node.js, Express.js        |
| **Database**       | MongoDB                    |
| **Authentication** | JWT / HTTP-only Cookies    |
| **Email Service**  | Nodemailer                 |
| **Payment Gateway**| eSewa API                  |
| **PDF Generation** | pdfkit                     |

---


---

## 📦 API Endpoints

| Base URL: `/api`          | Description                        |
|---------------------------|------------------------------------|
| `/client`                 | Manage clients                    |
| `/inventory`              | Inventory operations              |
| `/accounting`             | Accounting & transactions         |
| `/summary`                | Fetch system-wide summaries       |
| `/activity`               | Activity logs                     |
| `/customer`               | Manage customers                  |
| `/investment`             | Investment operations             |
| `/employee`               | Employee CRUD & assignments       |
| `/attendance`             | Attendance management             |
| `/esewa`                  | eSewa payment integrations        |

---

## 🔐 Authentication

- Uses **JWT tokens** stored in **HTTP-only cookies** for enhanced security.
- Role-based authorization ensures data isolation across companies and employees.

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/business-management-app.git
cd business-management-app

2️⃣ Backend Setup
cd backend
npm install



