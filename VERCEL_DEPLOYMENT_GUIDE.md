# Vercel Deployment Guide

This project is fully configured for deployment on **[Vercel](https://vercel.com)**.

The deployment runs:
- **Frontend**: Angular 18 Single Page Application (SPA) served from Vercel's global Edge CDN.
- **Backend API**: Node.js & Express serverless functions (`/api/*`) connected to MongoDB Atlas.

---

## Prerequisites: MongoDB Atlas Database (Free)

Vercel functions run in the cloud, so you need a cloud-hosted MongoDB database (a local `mongodb://127.0.0.1:27017` won't be accessible by Vercel).

1. Go to **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)** and sign up for a free account.
2. Create a free **M0 (Shared)** cluster (select any nearby region, e.g., Mumbai / AWS).
3. Under **Security > Database Access**:
   - Create a database user (e.g. `admin`) and set a secure password.
4. Under **Security > Network Access**:
   - Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel serverless functions can connect.
5. Under **Database > Clusters**:
   - Click **Connect** -> **Drivers** (Node.js) -> Copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/budget_utilization?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your user credentials).*

---

## Step-by-Step Vercel Deployment

### Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. **Sign in to Vercel**:
   Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account (`subhradeepkundu270305`).

2. **Import Repository**:
   - Click **Add New...** -> **Project**.
   - Under **Import Git Repository**, select `AI-Based-Budget-Utilization-Monitoring-System`.
   - Click **Import**.

3. **Configure Project Settings**:
   - **Framework Preset**: Other (or left as default).
   - **Root Directory**: `./` (leave default root).
   - **Build Command**: `npm run vercel-build` (automatically configured by `vercel.json`).
   - **Output Directory**: `frontend/dist/frontend/browser` (automatically configured by `vercel.json`).

4. **Add Environment Variables**:
   Under **Environment Variables**, add the following:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `MONGODB_URI` | `mongodb+srv://admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/budget_utilization?retryWrites=true&w=majority` | Your Atlas connection string |
   | `JWT_ACCESS_SECRET` | `super_secure_jwt_access_secret_key_minimum_32_characters_long` | At least 32 characters |
   | `JWT_REFRESH_SECRET` | `super_secure_jwt_refresh_secret_key_minimum_32_characters_long` | At least 32 characters |
   | `GEMINI_API_KEY` | `sk-or-v1-...` or `AIzaSy...` | *(Optional)* For AI assistant chatbot |
   | `NODE_ENV` | `production` | Production mode |

5. **Deploy**:
   - Click **Deploy**.
   - Vercel will install dependencies, build the Angular frontend, set up the serverless `/api` routes, and provide your live URL (e.g., `https://ai-based-budget-utilization.vercel.app`).

---

### Step 3: Seed Initial Data to MongoDB Atlas

Once your MongoDB Atlas cluster is created and your Vercel app is deployed, populate initial Indian budget schemes, departments, sample expenditures, and users:

1. In your local terminal, set your Atlas URI in `backend/.env`:
   ```bash
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.../budget_utilization?retryWrites=true&w=majority"
   ```
2. Run the seed script:
   ```bash
   cd backend
   npm run seed
   ```
   This will create:
   - Admin account: `admin@gov.in` / `Admin@1234`
   - Department Officer: `officer.education@gov.in` / `Officer@1234`
   - Auditor: `auditor@gov.in` / `Auditor@1234`
   - Viewer: `viewer@gov.in` / `Viewer@1234`
   - Indian Union Budget priority schemes, departments, allocations, and expenditures.

---

## Method 2: Deploy Using Vercel CLI

If you prefer deploying via terminal:

```bash
# 1. Install or run Vercel CLI
npx vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? your username
# - Link to existing project? No
# - Project name? ai-based-budget-utilization
# - Directory? ./
# - Want to modify settings? No

# 2. Add Environment Variables:
npx vercel env add MONGODB_URI
npx vercel env add JWT_ACCESS_SECRET
npx vercel env add JWT_REFRESH_SECRET
npx vercel env add GEMINI_API_KEY

# 3. Deploy to Production:
npx vercel --prod
```

---

## Verifying Your Live Deployment

- **Home Page**: `https://your-deployment.vercel.app/`
- **API Health Check**: `https://your-deployment.vercel.app/api/health`
- **Dashboard**: `https://your-deployment.vercel.app/dashboard`
- **Admin Panel**: `https://your-deployment.vercel.app/admin`
