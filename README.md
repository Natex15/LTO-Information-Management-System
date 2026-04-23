# LTO Information Management System

A full-stack web application for managing Land Transportation Office (LTO) driver records. Built with **React + Vite** on the frontend and **Node.js + Express** on the backend, connected to a **Supabase (PostgreSQL)** database.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 8, Axios             |
| Backend    | Node.js, Express 5, pg (node-postgres) |
| Database   | Supabase (PostgreSQL)               |
| Dev Tools  | Nodemon, ESLint                     |

---

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account with a project already set up

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Natex15/LTO-Information-Management-System.git
cd LTO-Information-Management-System
```

---

### 2. Configure the Server Environment

Navigate to the `server` directory and create a `.env` file:

```bash
cd server
```

Create a file named `.env` with the following contents:

```env
DATABASE_URL=postgresql://postgres.<your-project-ref>:<your-db-password>@aws-<region>.pooler.supabase.com:6543/postgres
PORT=5000
```

> **Where to find these values:**
> - Go to your Supabase project → **Settings → Database → Connection string → URI**
> - Replace `[YOUR-PASSWORD]` with your actual database password

---

### 3. Install Dependencies

Open **two separate terminals** — one for the server and one for the client.

**Terminal 1 — Server:**
```bash
cd server
npm install
```

**Terminal 2 — Client:**
```bash
cd client
npm install
```

---

### 5. Run the Application

**Terminal 1 — Start the backend server:**
```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
```

**Terminal 2 — Start the frontend:**
```bash
cd client
npm run dev
```

You should see something like:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 6. Open the App

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Environment Variables Reference

### `server/.env`

| Variable       | Description                                      | Example                          |
|----------------|--------------------------------------------------|----------------------------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string (URI)      | `postgresql://postgres...`       |
| `PORT`         | Port the Express server listens on               | `5000`                           |

>  **Never commit your `.env` file to Git.** It is already listed in `server/.gitignore`.

---

## Troubleshooting

### `http://localhost:5000/api/drivers` returns a server error

1. **Check your `.env` file** — Make sure `DATABASE_URL` is correctly set with no extra spaces or missing characters.
2. **Check Supabase credentials** — Confirm your password and project ref in the connection string.
3. **Check your table name** — The server queries `SELECT * FROM driver`. Ensure the table is named `driver` (lowercase) in Supabase.
4. **Check terminal logs** — The server prints `DB Error: <message>` to the terminal which pinpoints the exact issue.

### Frontend shows "No drivers found"

1. Make sure the **backend server is running** on port `5000`.
2. Make sure there is **data in your Supabase `driver` table**.
3. Open the browser **DevTools → Console** for any network or CORS errors.

### CORS error in browser console

The server already has `cors()` middleware applied globally. If you still see CORS issues, ensure the backend is running and accessible on port `5000`.
