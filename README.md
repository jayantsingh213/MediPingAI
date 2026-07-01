# MediPing AI - Real-time Medicine Availability Platform

MediPing AI is a premium, real-time medicine availability search and reservation platform. It is designed to save patients hours of calling or visiting pharmacies by allowing them to broadcast an inquiry to registered pharmacies in a 5–10 km radius and receive live responses in seconds.

---

## 🌟 Key Features

1. **User Website (Patient Portal)**
   - **Search Radar**: Type medicine names once to broadcast inquiries. Displays an expanding sonar animation that updates live as responses arrive.
   - **Interactive Route Map**: View responding pharmacies mapped side-by-side. Once reserved, it draws driving route polylines from the user's location to the store.
   - **Secure Pickup Receipt**: Confirmed reservations generate a unique QR code and 4-digit verification OTP.
   - **Personal Profile**: Full historical catalogue of past and pending medicine reservations.

2. **Pharmacy Dashboard**
   - **Real-Time Request Panel**: Incoming medicine inquiries pop up instantly via Socket.io.
   - **Accept/Reject controls**: Click "NO" to declare stock-outs, or click "YES" to trigger a pricing/quantity allocation dialog.
   - **OTP Verification counter**: Type the patient's 4-digit code to verify, matching and completing orders instantly.
   - **Inventory CRUD**: Manage active store stocks, item descriptions, and pricing tables.

3. **Admin Dashboard**
   - **Platform Directory**: Search, approve, reject, or suspend partner pharmacy licenses.
   - **System Performance Charts**: Monitor patient growth curves, popular medicine search demands, and response speed brackets.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS v4, Framer Motion, React Router v7, Lucide Icons, Recharts, Leaflet.js
- **Backend**: Node.js, Express.js, Socket.io, Mongoose (MongoDB Atlas)
- **Database Fallback**: A custom dual-mode service layer that connects to MongoDB Atlas if `MONGO_URI` is present, but otherwise falls back to a high-fidelity in-memory database preloaded with mock users, pharmacies, and inventory items.

---

## 📁 Repository Structure

```
d:\evolothon\
├── backend\
│   ├── config\            # Database configuration (MongoDB / Fallback trigger)
│   ├── models\            # Database Schemas (User, Pharmacy, Reservation, etc.)
│   ├── routes\            # Express REST API routes
│   ├── services\          # Geolocation distance calculators & simulation engines
│   └── sockets\           # Socket.io event receivers and broadcasting rooms
├── frontend\
│   ├── src\
│   │   ├── components\    # Reusable UI widgets (Navbar, Sidebar, Maps wrapper)
│   │   ├── context\       # React Auth and Socket states
│   │   ├── pages\         # UI views (Landing, login, dashboards, search, profiles)
│   │   └── index.css      # Custom CSS variables, radar animations, scrollbars
│   ├── vite.config.js     # Tailwind v4 plugin compilation setup
│   └── package.json
└── README.md              # Documentation
```

---

## 🚀 Setup & Execution

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

### 1. Boot up the Backend Server
```bash
# Navigate to backend folder
cd backend

# Install dependencies (already completed in workspace)
npm install

# Start the server
npm run dev
```
The server will start on **`http://localhost:5000`** and log:
`No MONGO_URI environment variable detected. Using premium In-Memory Database Fallback.`

### 2. Boot up the Frontend Client
```bash
# In a new terminal window, navigate to frontend folder
cd frontend

# Install dependencies (already completed in workspace)
npm install

# Run Vite dev server
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`** (or the URL printed in the terminal).

---

## 🧪 Step-by-Step Demo Evaluation Guide

We have integrated a **"Guest/Demo Mode"** that allows testing of the three roles with pre-configured accounts without requiring database or Firebase setups.

### Flow A: The Patient Path (Live Simulator)
1. Open `http://localhost:5173` and click **Sign In**.
2. Under the **Evaluation Guest Mode** panel, select the **Patient** tab and click **Sign In as Demo Patient** (logs in as `user@mediping.ai`).
3. On the dashboard, type **"Paracetamol 650mg"** in the search bar and click **Ping**.
4. You will be redirected to the live search page. Watch the sonar radar animation pulse.
5. In the background, our **Simulation Engine** will stagger responses from 4 nearby pharmacies:
   - *Apollo Pharmacy* responds as **Available** (120 strips, $15.00, 650 meters).
   - *LifeCare Pharmacy* responds as **Available** (80 strips, $18.00, 1.0 km).
   - *Gupta Medical Store* responds as **Unavailable** (Out of stock).
   - *Wellness First Pharmacy* responds as **Available** (150 strips, $14.00, 2.5 km).
6. Compare prices and distances, then click **Reserve** on *LifeCare Pharmacy*.
7. You are redirected to the Reservation confirmation page. Note your unique **OTP code (e.g. 7892)**.
8. The Leaflet map will render your location and draw a dotted blue routing polyline directly to the pharmacy.

### Flow B: The Live Pharmacist Flow (Multi-tab)
1. Open a second browser window in **Incognito Mode** alongside your first tab.
2. Go to `http://localhost:5173/login`, select the **Pharmacist** tab, and click **Sign In as Demo Pharmacist** (logs in as `pharmacy@mediping.ai`).
3. In your **Patient Tab**, return to the dashboard and trigger a new search (e.g. searching for **"Amoxicillin 500mg"**).
4. Instantly switch to your **Pharmacist Tab**. You will see a live request popup in your **Live Medicine Requests** panel displaying the requested drug.
5. Click **Yes / In Stock** on the pharmacist dashboard, input quantity `25` and unit price `115`, and click **Submit Response**.
6. Switch back to your **Patient Tab**. You will see the live responses listing update instantly with your custom stock and price!
7. Click **Reserve**.
8. Note the OTP in the patient confirmation screen. Enter that 4-digit code in the **Verification Counter** of the Pharmacist Tab, and click **Verify Code**. The reservation status will update to **Picked Up** on both screens instantly!
