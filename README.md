#  PizzaCraft — Pizza Delivery Web Application

A full-stack **pizza delivery** web application built with **React** and **Express.js**. Users can build custom pizzas by choosing from a variety of bases, sauces, cheeses, veggies, and meats — then pay securely with **Razorpay** and track their order in real time. Admins get a dedicated dashboard to manage inventory and process orders.

> **Oasis Infobyte Internship Task** — Full-Stack Web Development

---

##  Features

### 🛒 Customer Side
- **Custom Pizza Builder** — Choose a base, sauce, cheese, veggies, and meats to create your perfect pizza
- **Real-Time Pricing** — See the total update live as you add or remove toppings
- **Secure Checkout** — Pay online through Razorpay payment gateway integration
- **Order Tracking** — Track order status: *Order Received → In the Kitchen → Sent to Delivery → Delivered*
- **Order History** — View all past orders with full details

###  Authentication & Security
- **User Registration & Login** — JWT-based authentication with role-based access (user / admin)
- **Email Verification** — Account verification via email link
- **Forgot / Reset Password** — Secure password recovery flow with time-limited tokens
- **Firebase Integration** — Firebase for enhanced authentication support
- **Protected Routes** — Route guards for authenticated and admin-only pages

###  Admin Dashboard
- **Dashboard Overview** — View key metrics and order statistics at a glance
- **Inventory Management** — Full CRUD operations on pizza ingredients across 5 categories
- **Order Management** — View all orders and update their status through the delivery pipeline
- **Low-Stock Alerts** — Automated stock monitoring with email notifications to the admin

---

##  Tech Stack

| Layer        | Technology                                                                 |
|:-------------|:---------------------------------------------------------------------------|
| **Frontend** | React 18, React Router v6, Vite, Axios, React Icons                       |
| **Backend**  | Node.js, Express.js, Mongoose (MongoDB), JWT                              |
| **Auth**     | Firebase Authentication, JWT, bcryptjs                                    |
| **Payments** | Razorpay Payment Gateway                                                  |
| **Email**    | Nodemailer (Gmail SMTP) — verification, password reset, stock alerts      |
| **Cron**     | node-cron — automated low-stock monitoring every 30 minutes               |
| **Database** | MongoDB (Atlas or local)                                                  |

---

##  Project Structure

```
pizza-delivery/
├── client/                         # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx      # Admin-only route guard
│   │   │   ├── LoadingSpinner.jsx   # Reusable loading spinner
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── OrderStatusBadge.jsx # Order status indicator
│   │   │   ├── ProtectedRoute.jsx   # Auth route guard
│   │   │   └── Toast.jsx            # Toast notification system
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context provider
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── Inventory.jsx
│   │   │   │   └── OrderManagement.jsx
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   └── VerifyEmail.jsx
│   │   │   └── user/
│   │   │       ├── Checkout.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── MyOrders.jsx
│   │   │       └── PizzaBuilder.jsx
│   │   ├── services/               # API service modules
│   │   ├── styles/
│   │   │   └── index.css           # Global stylesheet
│   │   ├── firebase.js             # Firebase configuration
│   │   ├── App.jsx                 # Root component with routing
│   │   └── main.jsx                # Application entry point
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Express.js backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js       # Register, login, verify, reset password
│   │   ├── inventoryController.js  # CRUD for inventory items
│   │   ├── orderController.js      # Place orders, update status
│   │   └── paymentController.js    # Razorpay order creation & verification
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification & role-based guards
│   ├── models/
│   │   ├── Inventory.js            # Inventory schema (base, sauce, cheese, veggie, meat)
│   │   ├── Order.js                # Order schema with Razorpay & status tracking
│   │   └── User.js                 # User schema with password hashing & verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── orderRoutes.js
│   │   └── paymentRoutes.js
│   ├── services/
│   │   ├── emailService.js         # Nodemailer email templates (verify, reset, alerts)
│   │   └── stockMonitor.js         # Cron-based low-stock detection
│   ├── utils/
│   ├── scripts/
│   ├── seed.js                     # Database seeder (users + 28 inventory items)
│   ├── server.js                   # Express entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

##  Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Razorpay Account** — [Sign up](https://razorpay.com/) for API keys
- **Firebase Project** — [Create one](https://console.firebase.google.com/) for authentication
- **Gmail App Password** — for SMTP email (or any SMTP provider)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/pizza-delivery.git
cd pizza-delivery
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pizza-delivery
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@pizzadelivery.com
```

Seed the database with sample data:

```bash
npm run seed
```

> This creates an admin user (`admin@pizzadelivery.com` / `Admin@123`), a sample user (`john@example.com` / `User@123`), and 28 inventory items across 5 categories.

Start the server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Setup the Client

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Start the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint                | Description                |
|:-------|:------------------------|:---------------------------|
| POST   | `/api/auth/register`    | Register a new user        |
| POST   | `/api/auth/login`       | Login & get JWT token      |
| GET    | `/api/auth/verify/:token` | Verify email address     |
| POST   | `/api/auth/forgot-password` | Send password reset email |
| POST   | `/api/auth/reset-password/:token` | Reset password   |

### Inventory — `/api/inventory`

| Method | Endpoint                  | Description                       |
|:-------|:--------------------------|:----------------------------------|
| GET    | `/api/inventory`          | Get all inventory items           |
| POST   | `/api/inventory`          | Add new item *(admin only)*       |
| PUT    | `/api/inventory/:id`      | Update an item *(admin only)*     |
| DELETE | `/api/inventory/:id`      | Delete an item *(admin only)*     |

### Orders — `/api/orders`

| Method | Endpoint                  | Description                         |
|:-------|:--------------------------|:------------------------------------|
| POST   | `/api/orders`             | Place a new order                   |
| GET    | `/api/orders`             | Get orders (user's own or all for admin) |
| PUT    | `/api/orders/:id/status`  | Update order status *(admin only)*  |

### Payments — `/api/payment`

| Method | Endpoint                  | Description                       |
|:-------|:--------------------------|:----------------------------------|
| POST   | `/api/payment/create`     | Create a Razorpay order           |
| POST   | `/api/payment/verify`     | Verify Razorpay payment signature |

### Health Check

| Method | Endpoint         | Description               |
|:-------|:-----------------|:--------------------------|
| GET    | `/api/health`    | API health status check   |

---

##  Database Models

### User
- `name`, `email`, `password` (hashed with bcryptjs, salt round 12)
- `role` — `user` | `admin`
- `isVerified` — email verification status
- Verification & password reset tokens with expiry timestamps

### Inventory
- `category` — `base` | `sauce` | `cheese` | `veggie` | `meat`
- `name`, `description`, `price`, `quantity`
- `threshold` — low-stock alert level (default: 20)
- `isAvailable` — toggle availability

### Order
- `user` — reference to User
- `items` — `{ base, sauce, cheese, veggies[], meats[] }` with name & price
- `totalAmount`
- `razorpayOrderId`, `razorpayPaymentId`, `paymentStatus`
- `orderStatus` — `Order Received` → `In the Kitchen` → `Sent to Delivery` → `Delivered`
- `deliveryAddress`

---

##  Background Services

### Stock Monitor
A **cron job** runs every **30 minutes** to scan the inventory for items whose quantity has fallen below their configured threshold. When low-stock items are detected, an **alert email** is automatically sent to the admin via Nodemailer.

---

##  Available Scripts

### Server (`/server`)

| Script         | Command           | Description                         |
|:---------------|:------------------|:------------------------------------|
| `npm run dev`  | `node --watch server.js` | Start server with auto-reload |
| `npm start`    | `node server.js`  | Start server in production          |
| `npm run seed` | `node seed.js`    | Seed database with sample data      |

### Client (`/client`)

| Script            | Command          | Description                    |
|:------------------|:-----------------|:-------------------------------|
| `npm run dev`     | `vite`           | Start dev server with HMR      |
| `npm run build`   | `vite build`     | Build for production           |
| `npm run preview` | `vite preview`   | Preview production build       |

---

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Made with ❤️ 
</p>
