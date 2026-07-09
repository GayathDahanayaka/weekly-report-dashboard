# Weekly WorkHub Instructions

A weekly report / team dashboard app with two parts:

- **`backend/`** — Node.js + Express API, MongoDB (Mongoose), JWT auth, and a Gemini-powered AI assistant
- **`frontend/`** — React + Vite + Tailwind CSS

Follow the sections below in order: dependencies → database → backend → frontend.

---

## Prerequisites

Install these before you start:

| Tool | Minimum version | Check with |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18.x (20 LTS recommended) | `node -v` |
| npm | comes with Node | `npm -v` |
| A MongoDB database | Atlas (cloud) or local | see [Database](#3-database-setup) |
| A [Google Gemini API key](https://aistudio.google.com/apikey) | — | needed for the AI chat assistant only |

---

## 1. Installing dependencies

Clone or unzip the project, then install each side separately (they have separate `package.json` files).

```bash
# from the project root

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

This installs everything listed in each `package.json` — Express, Mongoose, JWT, bcrypt, etc. on the backend; React, Vite, Tailwind, Recharts, Axios on the frontend.

---

## 2. Environment variables

Both apps read config from a `.env` file, which is **not** committed to the repo. Copy the provided example files and fill in your own values.

### Backend — `backend/.env`

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

- `MONGO_URI` — see [Database setup](#3-database-setup) below for how to get this
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -hex 32` and paste the result)
- `GEMINI_API_KEY` — only required if you want the AI chat assistant to work; get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Leave the placeholder if you don't need it — the rest of the app works fine without it.

### Frontend — `frontend/.env`

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Leave this as-is for local development — it just needs to match wherever your backend is running.

---

## 3. Database setup

You need a MongoDB database. Pick **one** of the two options below.

### Option A — MongoDB Atlas (cloud, recommended, free tier available)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new (free tier) cluster
3. Under **Database Access**, create a database user with a username and password
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` to allow access from anywhere, fine for local dev)
5. Click **Connect → Drivers**, copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the credentials from step 3, and add a database name before the `?`, e.g. `.../weekly-ledger?retryWrites=true...`
7. Paste the full string into `MONGO_URI` in `backend/.env`

### Option B — Local MongoDB

1. Install MongoDB Community Server for your OS: [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start the local MongoDB service:
   ```bash
   # macOS (via Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod

   # Windows — runs automatically as a service after install,
   # or run "mongod" manually from the install directory
   ```
3. Use this as `MONGO_URI` in `backend/.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/weekly-ledger
   ```

No manual table/collection creation is needed — Mongoose creates collections automatically the first time data is written (e.g. when you register the first user).

---

## 4. Running the backend

```bash
cd backend
npm run dev
```

This starts the API with `nodemon` (auto-restarts on file changes) on **http://localhost:5000**.

You should see in the terminal:
```
MongoDB connected: <your-cluster-host>
Server running on http://localhost:5000
```

To check it's alive, visit **http://localhost:5000/api/health** — it should return `{"status":"ok"}`.

> Use `npm start` instead of `npm run dev` for a plain run without auto-restart (e.g. in production).

---

## 5. Running the frontend

In a **separate terminal** (keep the backend running):

```bash
cd frontend
npm run dev
```

This starts the Vite dev server, usually on **http://localhost:5173** (Vite will print the exact URL — if 5173 is busy it'll pick the next free port).

Open that URL in your browser.

---

## 6. First-time use

1. Go to the frontend URL, click **Create an account**
2. Register as a **manager** to access the Team Dashboard, or as a **member** to submit weekly reports
3. Register a second account with the other role to see both sides of the app
4. As a manager, add a project under **Projects** so members have something to report against

---

## Quick reference

| What | Command | URL |
|---|---|---|
| Install backend deps | `cd backend && npm install` | — |
| Install frontend deps | `cd frontend && npm install` | — |
| Run backend | `cd backend && npm run dev` | http://localhost:5000 |
| Run frontend | `cd frontend && npm run dev` | http://localhost:5173 |
| Health check | — | http://localhost:5000/api/health |

## Troubleshooting

- **`MongoDB connection failed`** — double check `MONGO_URI`, and for Atlas, that your IP is allowed under Network Access.
- **Frontend loads but API calls fail / network error** — make sure the backend is running first, and that `VITE_API_URL` in `frontend/.env` matches the backend's actual port.
- **AI chat gives a 403 or 429 error** — that's a Gemini account/quota issue, not a bug. See the note on `GEMINI_API_KEY` above; the rest of the app doesn't depend on it.
- **Port already in use** — change `PORT` in `backend/.env`, and update `VITE_API_URL` in `frontend/.env` to match.