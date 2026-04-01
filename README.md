# Online-Donation-Management-System
A full-stack donation management platform connecting Donors, Receivers &amp; NGOs — built with Node.js, Express, MongoDB &amp; Vanilla JS. Features JWT auth, 4 user roles, real-time notifications, and donation tracking with role-based dashboards.
🤝 Online Donation Management System
A full-stack web application that connects Donors, Receivers, NGOs, and Staff on a single platform to streamline charitable donations securely and transparently.

🌟 Features
For Donors

Register and log in securely with JWT authentication
Browse verified NGOs and Receivers
Make donations via UPI, Debit/Credit Card, or Net Banking
Track donation history with status (Pending, Completed, Refunded)
Request refunds on donations
Receive real-time notifications on donation activity

For Receivers

Register and await staff verification
View donations received on a personal dashboard
Get notified when a donation is received

For NGOs (Organizations)

Register organization with a unique registration number
Receive donations from donors
Manage featured campaigns with progress tracking

For Staff (Admin)

Verify and approve Receiver accounts
Manage all donations and update statuses
View platform-wide analytics and statistics
Access full donation history and donor/receiver records


🛠️ Tech Stack
LayerTechnologyFrontendHTML5, CSS3, Vanilla JavaScriptBackendNode.js, Express.jsDatabaseMongoDB (Atlas) + MongooseAuthJWT (JSON Web Tokens) + bcryptjsFile UploadMulterDev ToolsNodemon, dotenv

📁 Project Structure
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

🚀 Getting Started
Prerequisites

Node.js v18+
MongoDB Atlas account (free tier works)

1. Clone the repository
bashgit clone https://github.com/your-username/online-donation-system.git
cd online-donation-system
2. Install backend dependencies
bashcd backend
npm install
3. Set up environment variables
bashcp .env.example .env
Open .env and fill in your values:
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret_key
4. (Optional) Seed sample data
bashnode scripts/register_ngos.js
node scripts/seed_featured_campaigns.js
5. Start the backend server
bashnpm run dev       # Development (with nodemon)
npm start         # Production
Server runs at: http://localhost:3000
6. Run the frontend
Open the Frontend/ folder with Live Server in VS Code, or simply open Frontend/index.html in your browser.

🔌 API Endpoints
Auth — /api/auth
MethodEndpointDescriptionPOST/registerRegister new userPOST/loginLogin and get JWT tokenGET/meGet current logged-in userPUT/profileUpdate profile detailsPOST/change-passwordChange passwordPOST/profile/photoUpload profile photo
Donations — /api/donation
MethodEndpointDescriptionGET/publicPublic donation feed (no auth)GET/All donations (auth required)POST/Create a donationGET/:idGet donation by IDGET/search/advancedFilter & paginate donationsPUT/:id/statusUpdate donation status (staff)POST/:id/refundRequest refundGET/stats/overviewDonation statistics
Notifications — /api/notifications
MethodEndpointDescriptionGET/Get all notifications (paginated)GET/unread-countGet unread notification countPUT/:id/readMark notification as readPUT/mark-all-readMark all as readDELETE/:idDelete a notificationDELETE/clearClear all notifications
Other Routes

/api/stats — Platform-wide statistics
/api/feedback — Submit and view feedback
/api/organizations — Register and manage NGOs
/api/receivers — Browse verified receivers
/api/donor/dashboard — Donor-specific dashboard data
/api/receiver/dashboard — Receiver-specific dashboard data
/api/staff/dashboard — Admin dashboard data


👥 User Roles
RoleDescriptionVerification RequiredDonorMakes donations to NGOs and ReceiversNoReceiverReceives donations from DonorsYes (Staff approval)NGOOrganization receiving donationsYesStaffAdmin — manages platform and usersNo

🔒 Security Notes

Passwords are hashed using bcryptjs
All protected routes use JWT Bearer token authentication
Role-based access control enforced on all sensitive endpoints
.env file is excluded from version control — never commit secrets


📸 Screenshots

Add screenshots of your homepage, donor dashboard, and staff dashboard here


🙋‍♂️ Author
Shivam Baghel
📧 shivam6281baghel@gmail.com
🔗 LinkedIn

📄 License
This project is open source and available under the License
