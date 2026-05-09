<div align="center">
  <h1>🚦 LTO Information Management System</h1>
  <p><i>A comprehensive web application for managing Land Transportation Office records.</i></p>

  <p>
    <a href="https://lto-ims.vercel.app"><b>🚀 View Live Demo</b></a>
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
    <img alt="Express.js" src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
    <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
    <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </p>
</div>

---

## 🌟 Overview

The **LTO Information Management System** is a full-stack solution designed to streamline the management of driver records, vehicle registrations, and traffic violations. It features a fast, responsive frontend powered by **React** and **Vite**, securely connected to a **Node.js/Express** backend, with data persistently stored in a **Supabase (PostgreSQL)** database.

---

## ✨ Key Features

- **📊 Interactive Dashboard:** Data visualization using **Recharts** to display key metrics and summaries.
- **🧑‍✈️ Driver Management:** View, search, and add new drivers using a clean modal interface. Includes a detailed Driver Summary view.
- **🚗 Vehicle Registry:** Track and register vehicles associated with drivers.
- **🚨 Violations Tracking:** Comprehensive table view of traffic violations.
- **🔐 Secure Authentication:** JWT-based login system for administrators.
- **🎨 Modern UI/UX:** Built with vanilla CSS modules for a fast, responsive, and custom design.

---

## 🚀 Live Application

The application is deployed and hosted on Vercel. You can access it here:

🔗 **[https://lto-ims.vercel.app](https://lto-ims.vercel.app)**

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router, Recharts, Axios |
| **Backend** | Node.js, Express 5, JSON Web Token (JWT), pg (node-postgres), bcrypt |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Vercel (Serverless Functions & Static Hosting) |

---

## 💻 Local Development Setup

Follow these steps to run the application on your local machine.

### 1️⃣ Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account with a configured PostgreSQL database.

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/Natex15/LTO-Information-Management-System.git
cd LTO-Information-Management-System
```

### 3️⃣ Configure Environment Variables

You need to set up environment variables for both the backend and frontend.

**Backend (`server/.env`):**
Create a `.env` file in the `server` directory:
```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-<region>.pooler.supabase.com:6543/postgres
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
ADMIN_PASSWORD=your_admin_password
CLIENT_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
Create a `.env` file in the `client` directory (leave `VITE_API_URL` empty for local dev so Vite's proxy handles `/api` requests):
```env
VITE_API_URL=
```

### 4️⃣ Install Dependencies

Open two terminal windows/tabs.

**Terminal 1 (Backend):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
```

### 5️⃣ Run the Application

**Terminal 1 (Start Backend):**
```bash
npm run dev
# Expected output: Server running on port 5000
```

**Terminal 2 (Start Frontend):**
```bash
npm run dev
# Expected output: http://localhost:5173
```

Visit `http://localhost:5173` in your browser! 🎉

---

## ☁️ Vercel Deployment

The project is configured as a monorepo for seamless Vercel deployment using the `vercel.json` configuration at the root.

**Required Vercel Environment Variables:**
When deploying to Vercel, ensure you configure the following in your project's settings:

- `DATABASE_URL` — Your Supabase connection string.
- `JWT_SECRET` — Secret key for signing tokens.
- `ADMIN_PASSWORD` — Your secure admin password.
- `CLIENT_URL` — Your Vercel domain(s), comma-separated (e.g., `https://lto-ims.vercel.app,https://your-preview-link.vercel.app`).
- `VITE_API_URL` — Your main Vercel production domain (e.g., `https://lto-ims.vercel.app`).

---

## 🐛 Troubleshooting

<details>
<summary><b>Database Connection Errors</b></summary>
<br/>

- Verify your `DATABASE_URL` in `server/.env`.
- Ensure your Supabase database is active and the password contains no conflicting special characters (or they are properly URL-encoded).
</details>

<details>
<summary><b>CORS Errors on Login/API requests</b></summary>
<br/>

- **Local:** Ensure the backend is running on `PORT=5000` and `CLIENT_URL` includes `http://localhost:5173`.
- **Production:** Verify your `CLIENT_URL` in Vercel includes the exact origin you are requesting from (including Vercel preview URLs).
</details>

<details>
<summary><b>Empty Dashboard / No Data</b></summary>
<br/>

- Ensure your Supabase tables (`drivers`, `vehicles`, `violations`) are properly created and populated with data.
</details>

---

<div align="center">
  <i>Built with ❤️ for the LTO Information Management System</i>
</div>
