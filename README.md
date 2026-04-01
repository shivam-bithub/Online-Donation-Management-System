# 🤝 Online Donation Management System

A full-stack web application that connects **Donors**, **Receivers**, **NGOs**, and **Staff** on a single platform to streamline charitable donations securely and transparently.

---

## 🌟 Features

### For Donors
- Register and log in securely with JWT authentication
- Browse verified NGOs and Receivers
- Make donations via UPI, Debit/Credit Card, or Net Banking
- Track donation history with status (Pending, Completed, Refunded)
- Request refunds on donations
- Receive real-time notifications on donation activity

### For Receivers
- Register and await staff verification
- View donations received on a personal dashboard
- Get notified when a donation is received

### For NGOs (Organizations)
- Register organization with a unique registration number
- Receive donations from donors
- Manage featured campaigns with progress tracking

### For Staff (Admin)
- Verify and approve Receiver accounts
- Manage all donations and update statuses
- View platform-wide analytics and statistics
- Access full donation history and donor/receiver records

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| File Upload | Multer |
| Dev Tools | Nodemon, dotenv |

---

## 📁 Project Structure

```
dd-new/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── donationController.js  # Donation CRUD + stats
│   │   ├── feedbackController.js  # Feedback management
│   │   ├── homeController.js      # Homepage data
│   │   ├── notificationController.js # Notification system
│   │   ├── organizationController.js # NGO management
│   │   └── statsController.js    # Platform statistics
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── uploadMiddleware.js    # Multer file upload
│   ├── models/
│   │   ├── Donation.js
│   │   ├── FeaturedCampaign.js
│   │   ├── Feedback.js
│   │   ├── Ngo.js
│   │   ├── Notification.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donation.js
│   │   ├── donorDashboard.js
│   │   ├── feedback.js
│   │   ├── notification.js
│   │   ├── organizationRoutes.js
│   │   ├── receiverDashboard.js
│   │   ├── staffDashboard.js
│   │   └── statsRoutes.js
│   ├── scripts/                   # Seed & test scripts
│   ├── server.js                  # App entry point
│   └── .env.example               # Environment variable template
└── Frontend/
    ├── index.html                 # Homepage
    ├── login.html
    ├── register.html
    ├── donation.html
    ├── donor-dashboard.html
    ├── receiver-dashboard.html
    ├── staff-dashboard.html
    ├── feedback.html
    ├── profile.html
    ├── organization-register.html
    ├── css/
    └── js/
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/online-donation-system.git
cd online-donation-system
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in your values:
```
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret_key
```

### 4. (Optional) Seed sample data
```bash
node scripts/register_ngos.js
node scripts/seed_featured_campaigns.js
```

### 5. Start the backend server
```bash
npm run dev       # Development (with nodemon)
npm start         # Production
```
Server runs at: `http://localhost:3000`

### 6. Run the frontend
Open the `Frontend/` folder with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code, or simply open `Frontend/index.html` in your browser.

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get JWT token |
| GET | `/me` | Get current logged-in user |
| PUT | `/profile` | Update profile details |
| POST | `/change-password` | Change password |
| POST | `/profile/photo` | Upload profile photo |

### Donations — `/api/donation`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public` | Public donation feed (no auth) |
| GET | `/` | All donations (auth required) |
| POST | `/` | Create a donation |
| GET | `/:id` | Get donation by ID |
| GET | `/search/advanced` | Filter & paginate donations |
| PUT | `/:id/status` | Update donation status (staff) |
| POST | `/:id/refund` | Request refund |
| GET | `/stats/overview` | Donation statistics |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all notifications (paginated) |
| GET | `/unread-count` | Get unread notification count |
| PUT | `/:id/read` | Mark notification as read |
| PUT | `/mark-all-read` | Mark all as read |
| DELETE | `/:id` | Delete a notification |
| DELETE | `/clear` | Clear all notifications |

### Other Routes
- `/api/stats` — Platform-wide statistics
- `/api/feedback` — Submit and view feedback
- `/api/organizations` — Register and manage NGOs
- `/api/receivers` — Browse verified receivers
- `/api/donor/dashboard` — Donor-specific dashboard data
- `/api/receiver/dashboard` — Receiver-specific dashboard data
- `/api/staff/dashboard` — Admin dashboard data

---

## 👥 User Roles

| Role | Description | Verification Required |
|------|-------------|----------------------|
| Donor | Makes donations to NGOs and Receivers | No |
| Receiver | Receives donations from Donors | Yes (Staff approval) |
| NGO | Organization receiving donations | Yes |
| Staff | Admin — manages platform and users | No |

---

## 🔒 Security Notes
- Passwords are hashed using **bcryptjs**
- All protected routes use **JWT Bearer token** authentication
- Role-based access control enforced on all sensitive endpoints
- `.env` file is excluded from version control — never commit secrets

---

## 📸 Screenshots

> _Add screenshots of your homepage, donor dashboard, and staff dashboard here_

---

## 🙋‍♂️ Author

**Shivam Baghel**  
MCA Student — Madhav Institute of Technology & Science, Gwalior  
📧 shivam6281baghel@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/shivam-baghel-software-devloper)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
