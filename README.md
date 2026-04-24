# MedConnect BD — Telemedicine Platform
### CSE309 Web Application Project
**Student:** Mehebu Rubaya Reya | **ID:** 2211312 | **Section:** 05 | Spring 2026  
**Course:** Web Application and Internet | Independent University Bangladesh

---

## 🗂 Project Structure

```
medconnect/
├── frontend/               ← React app (npm start)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.js       ← Full marketing page
│   │   │   ├── AuthModal.js         ← Login / Register modal
│   │   │   ├── PatientDashboard.js  ← Patient panel (4 tabs)
│   │   │   ├── DoctorDashboard.js   ← Doctor panel (6 tabs)
│   │   │   ├── AdminDashboard.js    ← Admin panel (5 tabs)
│   │   │   ├── DoctorsPage.js       ← Browsable doctor directory
│   │   │   ├── BookingPage.js       ← Full booking flow
│   │   │   ├── PrescriptionPage.js  ← Printable prescription
│   │   │   └── Sidebar.js           ← Shared sidebar nav
│   │   ├── App.js           ← Router + page switcher
│   │   ├── AuthContext.js   ← Global auth state
│   │   ├── ToastContext.js  ← Notification toasts
│   │   ├── api.js           ← All PHP API calls
│   │   └── index.css        ← Full design system
│   └── package.json
│
└── backend/                ← PHP + MySQL
    ├── config/
    │   ├── database.php     ← DB connection + constants
    │   └── helpers.php      ← JWT, CORS, sanitize utils
    ├── api/
    │   ├── auth/
    │   │   ├── register.php
    │   │   ├── login.php
    │   │   ├── profile.php  ← GET + PUT
    │   │   └── logout.php
    │   ├── doctors/
    │   │   ├── index.php    ← List with filters
    │   │   ├── show.php     ← Single doctor
    │   │   └── slots.php    ← Available time slots
    │   ├── appointments/
    │   │   ├── store.php    ← Book
    │   │   ├── index.php    ← List
    │   │   ├── cancel.php
    │   │   └── update.php   ← Status change
    │   ├── prescriptions/
    │   │   ├── store.php    ← Doctor issues Rx
    │   │   ├── index.php    ← List
    │   │   └── show.php     ← Single Rx with medicines
    │   ├── records/
    │   │   ├── index.php
    │   │   └── store.php    ← File upload
    │   ├── admin/
    │   │   ├── stats.php
    │   │   ├── users.php
    │   │   └── verify_doctor.php
    │   └── contact/
    │       └── store.php
    ├── uploads/             ← Auto-created on first upload
    ├── database.sql         ← Full schema + seed data
    └── .htaccess
```

---

## 🚀 Setup in VS Code (Step by Step)

### Prerequisites — Install These First

| Tool | Download |
|------|----------|
| **Node.js** (v18+) | https://nodejs.org |
| **XAMPP** (PHP + MySQL + Apache) | https://apachefriends.org |

---

### STEP 1 — Start XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Both should show green

---

### STEP 2 — Set Up the Database

1. Open browser → go to **http://localhost/phpmyadmin**
2. Click **"New"** in the left sidebar
3. Create database named `medconnect_bd` → click **Create**
4. Click on `medconnect_bd` in the sidebar
5. Click the **SQL** tab at the top
6. Open `backend/database.sql` in VS Code, **copy all contents**
7. Paste into phpMyAdmin SQL tab → click **Go**
8. You should see all tables created ✓

---

### STEP 3 — Place Backend in XAMPP

Copy the entire `backend/` folder into XAMPP's web root:

- **Windows:** `C:\xampp\htdocs\medconnect\`
- **Mac:** `/Applications/XAMPP/htdocs/medconnect/`

So the path becomes:
```
htdocs/
└── medconnect/
    └── backend/
        ├── api/
        ├── config/
        └── .htaccess
```

Test it: open http://localhost/medconnect/backend/api/doctors/index.php  
You should see JSON with doctor data ✓

---

### STEP 4 — Configure Database Password (if needed)

If your MySQL has a password, open `backend/config/database.php` and update:

```php
define('DB_USER', 'root');     // your MySQL username
define('DB_PASS', '');         // your MySQL password (blank by default in XAMPP)
```

---

### STEP 5 — Run the React Frontend

Open VS Code terminal (`Ctrl + `` ` ``) and run:

```bash
cd frontend
npm install
npm start
```

The browser opens automatically at **http://localhost:3000** ✓

---

## 🔑 Test Login Credentials

All demo accounts use password: **`password`**

| Role    | Email                      | Password   |
|---------|----------------------------|------------|
| Admin   | admin@medconnect.bd        | password   |
| Patient | farida@example.com         | password   |
| Patient | karim@example.com          | password   |
| Doctor  | rashida@medconnect.bd      | password   |
| Doctor  | imran@medconnect.bd        | password   |
| Doctor  | fahmida@medconnect.bd      | password   |

---

## ✅ Features — All Buttons Working

### Public Landing Page
- ✅ Navbar scroll effect + smooth scroll links
- ✅ Hero "Consult a Doctor" and "How It Works" buttons
- ✅ Doctor cards with "Book Now" → opens auth
- ✅ "View All Doctors" → full doctors directory
- ✅ Contact form → saves to database
- ✅ Sign In / Get Started → opens auth modal

### Auth Modal
- ✅ Login with role selector (Patient / Doctor / Admin)
- ✅ Register with validation (name, email, password match)
- ✅ Doctor registration includes BMDC + specialization
- ✅ JWT token saved to localStorage
- ✅ Routes to correct dashboard by role

### Patient Dashboard
- ✅ Overview with stat cards
- ✅ Appointments tab — upcoming + past, with Cancel button
- ✅ Prescriptions tab — view + download PDF (print)
- ✅ Health Records — upload files + list
- ✅ Profile — edit personal info + change password
- ✅ "+ New Appointment" → doctors directory → booking

### Doctor Dashboard
- ✅ Overview with today's schedule + "Join" buttons
- ✅ Appointments — filter by status, join/complete/add notes
- ✅ Issue Prescription modal — add medicines dynamically
- ✅ Patient list with "View Records"
- ✅ Schedule management (days + hours + checkboxes)
- ✅ Profile editing with specialization

### Admin Dashboard
- ✅ System-wide stats
- ✅ Manage Doctors — verify/revoke with search filter
- ✅ Manage Patients — view/suspend
- ✅ All Appointments view
- ✅ System info + quick action buttons

### Doctors Directory
- ✅ Search by name/specialty
- ✅ Filter by specialty tabs
- ✅ Available Only checkbox
- ✅ Sort by rating/fee/experience
- ✅ Book Now → full booking flow

### Booking Page
- ✅ Consultation type selector (Video/Voice/Chat)
- ✅ Date picker (next 7 days)
- ✅ Real-time slot availability from API
- ✅ Summary card + Confirm Booking
- ✅ Success confirmation screen

### Prescription Page
- ✅ Full formatted prescription document
- ✅ Print / Save as PDF button
- ✅ Share with Pharmacy button

---

## 🗄 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | All users (patients, doctors, admins) |
| `doctor_profiles` | Doctor details, BMDC, specialty, fee |
| `doctor_schedules` | Weekly availability |
| `appointments` | All bookings |
| `prescriptions` | Issued prescriptions |
| `prescription_medicines` | Medicine rows per prescription |
| `health_records` | Uploaded files |
| `reviews` | Patient ratings |
| `contact_messages` | Contact form submissions |

---

## 🔧 Troubleshooting

**"CORS error" in browser console**
→ Make sure Apache is running in XAMPP  
→ Check backend is at `http://localhost/medconnect/backend/api/`

**"Database connection failed"**
→ Make sure MySQL is running in XAMPP  
→ Check username/password in `database.php`

**Frontend shows mock data instead of real data**
→ This is expected when backend is not connected — the app works with demo data  
→ Connect backend following Step 3 above

**npm install fails**
→ Make sure Node.js v18+ is installed: run `node -v`

---

*MedConnect Bangladesh — CSE309 Spring 2026*
