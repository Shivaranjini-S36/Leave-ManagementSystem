# Leave Management System

A web-based Leave Management System designed for organizations, featuring dual role-based dashboards for **Employees** and **Managers**, real-time leave balance tracking (Casual Leave and Medical Leave), manager approval/rejection workflows with custom remarks, and complete employee leave history inspection.

Live Demo: [https://shivaranjini-s36.github.io/Leave-ManagementSystem/](https://shivaranjini-s36.github.io/Leave-ManagementSystem/)

---

## 🚀 Key Features

### 1. Dual Role-Based Authentication
- Choose **Employee** or **Manager** role upon sign in or registration.
- Quick 1-click demo logins pre-configured for evaluation.
- Session persistence and secure state handling.

### 2. Employee Dashboard
- **Live Balances**:
  - Casual Leave Balance (Default: 12 / 12)
  - Medical Leave Balance (Default: 10 / 10)
  - Real-time Pending Requests Counter
- **Apply for Leave Form**:
  - Pre-filled employee credentials
  - Leave type selection (Casual Leave / Medical Leave)
  - Start Date & End Date pickers with automated duration calculation
  - Instant leave balance validation
- **My Leave History**:
  - Full audit trail of past leave requests, dates, status badges (Pending, Approved, Rejected), and manager remarks.

### 3. Manager Dashboard
- **Overview Metrics**:
  - Total Requests (8)
  - Pending Requests (3)
  - Approved Requests (3)
- **Live Employee Search**:
  - Instant search and filtering by employee name, email, leave type, or reason.
- **Approval & Rejection Workflow**:
  - Dedicated action buttons to **Approve** or **Reject** with customized remarks/reasons.
- **Employee Leave History Inspector**:
  - Manager can view the complete past leave history and balance breakdown for any specific employee at any time.

---

## 💻 Tech Stack
- **HTML5 & Modern CSS3** with Plus Jakarta Sans typography and responsive design
- **Vanilla JavaScript (ES6+)** with modular class-based architecture
- **Local Storage API** for persistent state across browser reloads
- **Zero External Dependencies** — lightweight, fast, and directly deployable on GitHub Pages!

---

## 🔑 Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Employee** | `shivi@gmail.com` | `password123` | Casual: 12/12, Medical: 10/10, Pending: 0 |
| **Employee** | `kungumashivi7@gmail.com` | `password123` | Includes pending & approved records |
| **Manager** | `ammu@gmail.com` | `password123` | Manager dashboard with 8 leave requests |

---

## 🛠️ Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/shivaranjini-s36/Leave-ManagementSystem.git
   ```
2. Open `index.html` in any web browser.
