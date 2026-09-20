# MERN Chat App - Deployment & Local Setup Guide

This guide explains how to run the project locally and how to deploy the **Backend on Render** and the **Frontend on Cloudflare Pages** for lightning-fast edge performance.

---

## 🚀 1. Running Locally (Step-by-Step)

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Database (configured in `.env`)

### Step 1: Install Dependencies
Install dependencies directly inside each folder:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
- `backend/.env` (Backend):
```env
PORT=5000
MONGO_DB_URI=mongodb+srv://shashikantrupin123:rupin123@cluster0.iulmqkl.mongodb.net/chat-app-db?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_mern_chat_app_2026_shashikant
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

- `frontend/.env` (Frontend):
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Step 3: Start the Servers
- **Start Backend** (in Terminal 1):
```bash
cd backend
npm run dev
```
Backend will start on `http://localhost:5000` and connect to MongoDB.

- **Start Frontend** (in Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend will be accessible at `http://localhost:3000`.

---

## 🌐 2. Deploying Backend on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `mern-chat-app`.
4. Configure the Web Service settings:
   - **Name**: `mern-chat-backend` (or any name you prefer)
   - **Region**: Choose the closest region (e.g. Frankfurt / Singapore / Oregon)
   - **Branch**: `main` (or `master`)
   - **Root Directory**: `backend` (⚠️ Set to `backend`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Environment Variables**, add the following:
   - `PORT`: `5000` (or leave default, Render sets `PORT` automatically)
   - `MONGO_DB_URI`: `mongodb+srv://shashikantrupin123:rupin123@cluster0.iulmqkl.mongodb.net/chat-app-db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_secure_jwt_secret_key_here`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://<your-cloudflare-pages-subdomain>.pages.dev` (You can update this after creating your Cloudflare Pages project)
6. Click **Create Web Service**.
7. Note down your backend URL (e.g. `https://mern-chat-backend.onrender.com`).

---

## ⚡ 3. Deploying Frontend on Cloudflare Pages

Cloudflare Pages provides global CDN edge caching, sub-millisecond TTFB, and free SSL.

### Method A: Git Integration (Recommended)
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your `mern-chat-app` repository.
3. Configure the build settings:
   - **Project Name**: `mern-chat-app` (or custom name)
   - **Production Branch**: `main` (or `master`)
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - Variable Name: `VITE_BACKEND_URL`
   - Value: `https://<your-render-backend-url>.onrender.com` (e.g., `https://mern-chat-backend.onrender.com`)
5. Click **Save and Deploy**.
6. Cloudflare will build and deploy your frontend to `https://<project-name>.pages.dev`.

### Method B: Wrangler CLI (Alternative)
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=mern-chat-app
```

---

## 🔄 4. Linking Frontend and Backend

1. Copy your Cloudflare Pages URL (e.g. `https://mern-chat-app.pages.dev`).
2. Go to your Render Web Service -> **Environment** -> update `FRONTEND_URL` to `https://mern-chat-app.pages.dev`.
3. Save changes (Render will automatically re-deploy).
4. That's it! Your fast frontend on Cloudflare Pages will now seamlessly talk to your Render backend with WebSockets (Socket.io) and cross-origin authentication cookies!
