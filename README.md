# AI-Based Budget Utilization Monitoring System (BUMS)
### Real-Time Fiscal Intelligence, Public Expenditure Telemetry & Algorithmic Anomaly Detection for India

[![Live Production](https://img.shields.io/badge/Live%20Demo-ai--based--budget--utilization--monitor--five.vercel.app-0D9488?style=for-the-badge&logo=vercel)](https://ai-based-budget-utilization-monitor-five.vercel.app)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520.0.0-339933?logo=node.js)](https://nodejs.org)
[![Angular](https://img.shields.io/badge/Angular-19.2-DD0031?logo=angular)](https://angular.dev)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-47A248?logo=mongodb)](https://mongodb.com)
[![Deployment](https://img.shields.io/badge/Status-Active%20Deployment-success?logo=vercel)](https://ai-based-budget-utilization-monitor-five.vercel.app)

> 🔗 **Live Website**: [https://ai-based-budget-utilization-monitor-five.vercel.app](https://ai-based-budget-utilization-monitor-five.vercel.app)

---

## 🏛️ Executive Summary

The **AI-Based Budget Utilization Monitoring System (BUMS)** is a high-performance, enterprise-grade public financial monitoring platform designed to provide transparent, real-time oversight of Central and State Government scheme expenditure across India. 

Integrating telemetry from the **Public Financial Management System (PFMS)** and **State Single Nodal Agencies (SNA)**, the platform monitors **₹16.03 Lakh Crore** in annual budget allocations across all **36 States & Union Territories** and **780+ administrative districts**. It actively prevents end-of-year fiscal rushes, detects fraudulent expenditure spikes, flags lagging welfare funds, and democratizes public audit data for executive officers, treasury auditors, and citizens.

---

## 📐 System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Tier (Angular 19 SPA)"]
        UI["Civic Budget Portal & Home Conclave Hub"]
        Dashboard["National Telemetry Dashboard & GeoJSON Heatmap"]
        AdminPanel["Admin Governance & Threshold Manager"]
        FinoraWidget["Finora AI Assistant Chat Widget"]
    end

    subgraph EdgeRouting ["Edge Delivery & Routing (Vercel Edge Network)"]
        Edge["Vercel Global CDN & Reverse Proxy"]
        StaticCDN["Static Assets & Pre-rendered SPA Bundles"]
        ServerlessRewriter["/api/* Route Forwarder"]
    end

    subgraph ServiceLayer ["Application & Intelligence Tier (Node.js / Express)"]
        ServerlessHandler["Vercel Serverless Function (api/index.js)"]
        ExpressApp["Express Application Factory (backend/app.js)"]
        
        subgraph Middlewares ["Security & Validation Pipeline"]
            AuthGuard["JWT & HTTP-Only Cookie Auth"]
            RBAC["Role-Based Access Control (Admin/Officer/Auditor/User)"]
            RateLimit["Express Rate Limiting & Helmet Guard"]
        end

        subgraph CoreEngines ["Domain Services & Processing"]
            AnomalyEngine["Fiscal Anomaly & Spike Detection Engine"]
            ReportGen["PDFKit & CSV Audit Report Generator"]
            ChatController["Context-Aware Chat Controller"]
        end
    end

    subgraph ExternalServices ["External Intelligence & Cloud Persistence Tier"]
        MongoDB[("MongoDB Atlas (Cloud Cluster)\nConnection Pooling & Mongoose ODM")]
        OpenRouter["OpenRouter Gateway (google/gemini-2.5-flash)\nNatural Language Public Finance Telemetry"]
    end

    UI --> Edge
    Dashboard --> Edge
    AdminPanel --> Edge
    FinoraWidget --> Edge

    Edge --> StaticCDN
    Edge --> ServerlessRewriter
    ServerlessRewriter --> ServerlessHandler

    ServerlessHandler --> ExpressApp
    ExpressApp --> Middlewares
    Middlewares --> CoreEngines

    AnomalyEngine --> MongoDB
    ReportGen --> MongoDB
    ChatController --> MongoDB
    ChatController --> OpenRouter
```

---

## 🌟 Key Features & Capabilities

### 1. Civic Public Finance Portal
* **Interactive Conclave Carousel**: Smooth 5-slide circular carousel highlighting national audit reviews, fiscal conclaves, AI workshops, and DBT welfare telemetry.
* **Official Delegate Registration**: Dedicated registration page (`/event-register`) with instant verification passes for national budget briefings and public hearings.
* **Fiscal Transparency Benchmarks**: Real-time state compliance metrics and Open Budget Survey research insights.

### 2. National Telemetry Dashboard & Geospatial Heatmap
* **D3 & GeoJSON Interactive Map**: Visualizes absorption rates across all 36 Indian States and Union Territories with color-coded risk categorizations:
  * 🟢 **Optimal (45% – 100%)**: Sustainable, on-track fund utilization.
  * 🟡 **Over-Utilized (> 100%)**: Overspending or unapproved deficit escalation.
  * 🔴 **Lagging (< 45%)**: Chronic underspending requiring administrative intervention.
* **Comprehensive Fiscal Metrics**: Total allocated schemes, cumulative expenditure, remaining balances, and trend charts powered by Chart.js.

### 3. Automated Anomaly Detection Engine
Runs automated pattern recognition against real-time vouchers to catch irregularities:
* **Under-Utilization Alert**: Flags schemes where time elapsed is ≥ 70% of the financial year but less than 40% of funds are absorbed.
* **Spending Spike Alert**: Automatically intercepts single vouchers that consume > 25% of the remaining total allocation.
* **Fiscal Pace Deviation Alert**: Detects schemes deviating > 20% from linear disbursement velocity.
* **March Rush Mitigation**: Prevents fiscal year-end dumping into idle commercial bank accounts.

### 4. Finora AI Fiscal Assistant
* Embedded chatbot connected to Google Gemini via OpenRouter API.
* Automatically ingests live database statistics (allocations, department spending, open alerts) into conversational system context.
* Answers complex fiscal queries concisely in plain language for ministers, officers, and auditors.

### 5. Multi-Tier Role-Based Access Control (RBAC)
* Strict privilege isolation enforcing the Principle of Least Privilege:
  * **Admin**: Complete system governance, user provisioning, threshold configuration, and audit logs.
  * **Finance Officer**: Multi-department budget modifications, expenditure validation, and alert resolution.
  * **Department Head**: Department-specific fund monitoring and expenditure voucher recording.
  * **Citizen User**: Read-only oversight access to national dashboards and public reports.

---

## 📁 Repository Structure

```
├── api/
│   └── index.js                 # Vercel Serverless Function entrypoint
├── backend/
│   ├── config/
│   │   ├── db.js                # Serverless-ready MongoDB Atlas connection caching
│   │   └── env.js               # Strict environment schema and fallbacks
│   ├── controllers/             # Express route controllers (Auth, Budget, Chat, etc.)
│   ├── middleware/              # JWT, RBAC guards, Multer upload, Error handlers
│   ├── models/                  # Mongoose models (User, Budget, Expenditure, Alert, etc.)
│   ├── routes/                  # Express REST route modules
│   ├── seed/
│   │   └── seed.js              # Database seeder for Indian ministries & schemes
│   ├── services/
│   │   └── anomalyEngine.js     # Statistical & rule-based anomaly detection engine
│   ├── utils/                   # Tokens, audit logger, pagination, HTTP errors
│   ├── app.js                   # Reusable Express application factory
│   ├── server.js                # Local development and standalone server runner
│   └── .env.example             # Safe environment variable template
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # API services, Auth guards, Interceptors, Models
│   │   │   ├── features/
│   │   │   │   ├── admin/       # User management, audit logs, anomaly thresholds
│   │   │   │   ├── alerts/      # Open and resolved fiscal anomalies
│   │   │   │   ├── auth/        # Login, quick access, and authentication pages
│   │   │   │   ├── blog/        # Indian fiscal research & policy insights
│   │   │   │   ├── budgets/     # Scheme allocation creator and tracking tables
│   │   │   │   ├── dashboard/   # National overview, GeoJSON heatmap, state reports
│   │   │   │   ├── departments/ # Ministry-wise reports and exports (PDF/CSV)
│   │   │   │   ├── expenditures/# Voucher recording and payment voucher logs
│   │   │   │   └── home/        # Civic landing page and event registration
│   │   │   └── shared/          # Navigation shell, status banner, Finora chat bubble
│   │   └── index.html           # HTML5 root with Google Fonts & Indian Govt meta
│   ├── public/assets/           # High-resolution WebP/JPG assets & india-states.geojson
│   ├── angular.json             # Calibrated Angular 19 esbuild application config
│   └── vercel.json              # Frontend-level Vercel rewrite configuration
├── .gitignore                   # Excludes secrets, node_modules, and build outputs
├── LICENSE                      # MIT License (Subhradeep Kundu)
├── package.json                 # Unified root monorepo build scripts and dependencies
├── package-lock.json            # Deterministic lockfile for Vercel builds
├── vercel.json                  # Root Vercel Edge routing and serverless rewrites
└── README.md                    # Project documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Angular 19 (Standalone Components, Signals, Reactive Forms, Control Flow) |
| **Styling & UI** | Pure Modern CSS, Glassmorphic Design, Responsive Flex/Grid, Custom Animations |
| **Visualizations** | D3.js (GeoJSON State Chloropleth), Chart.js 4, ng2-charts |
| **Backend Runtime** | Node.js (v20+ LTS) |
| **Web Framework** | Express.js 4 (Modular Routers, Application Factory) |
| **Database & ODM** | MongoDB Atlas Cloud Cluster, Mongoose 8 (Connection Pool Caching) |
| **AI Engine** | Google Gemini (via OpenRouter API gateway) |
| **Security & Auth** | JSON Web Tokens (Access + Refresh Cookie), Bcrypt Password Hashing, Helmet HTTP Headers |
| **Document Export** | PDFKit (Dynamic PDF generation), json2csv (Data auditing exports) |
| **Deployment Target** | Vercel (Edge CDN + Node.js Serverless Functions) |

---

## 🔐 Environment Configuration

Create a `.env` file in `backend/` (or supply these in your Vercel Project Settings):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development` or `production`) | `production` |
| `PORT` | Local backend HTTP listening port | `5000` |
| `MONGODB_URI` | MongoDB connection URI (Atlas connection string for cloud) | `mongodb+srv://user:pass@cluster0...` |
| `JWT_ACCESS_SECRET` | 32+ character cryptographic secret for access tokens | `your_super_secret_access_key_min_32_chars` |
| `JWT_REFRESH_SECRET`| 32+ character cryptographic secret for refresh cookies | `your_super_secret_refresh_key_min_32_chars` |
| `JWT_ACCESS_EXPIRES`| Access token expiration duration | `15m` |
| `JWT_REFRESH_EXPIRES`| Refresh token expiration duration | `7d` |
| `FRONTEND_ORIGIN` | Allowed origin for CORS requests | `http://localhost:4200` |
| `COOKIE_SECURE` | Enforce HTTPS-only flag on refresh token cookie | `true` (in production) |
| `COOKIE_SAMESITE` | SameSite cookie policy (`lax` or `none`) | `none` (cross-domain) / `lax` (same-origin) |
| `UPLOAD_DIR` | Directory for document attachments | `/tmp` (Vercel) or `uploads` (Local) |
| `CRON_ENABLED` | Enable automated 02:00 AM anomaly detection cron | `false` on serverless, `true` on VM |
| `GEMINI_API_KEY` | OpenRouter / Google Gemini API key for Finora AI | `sk-or-v1-...` |

---

## 🚀 Quick Start & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/subhradeepkundu270305/AI-Based-Budget-Utilization-Monitoring-System.git
cd AI-Based-Budget-Utilization-Monitoring-System
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install
npm run seed      # Populates departments, budgets, and demo users
npm run dev       # Starts Express API on http://localhost:5000
```

### 3. Configure Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev       # Starts Angular dev server on http://localhost:4200
```
Open **[http://localhost:4200](http://localhost:4200)** in your browser.

---

## ⚡ Deployment to Vercel

The repository includes zero-config serverless support for **[Vercel](https://vercel.com)**:

1. **Import to Vercel**: Connect your GitHub account and import `AI-Based-Budget-Utilization-Monitoring-System`.
2. **Environment Variables**: Add `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`, and `GEMINI_API_KEY`.
3. **Deploy**: Vercel executes `npm run vercel-build`, deploys the Angular bundle to the global Edge CDN, and maps `/api/*` to the serverless function in `api/index.js`.

---

## 🔑 Seeded Demo Accounts

After running the database seed script (`npm run seed`), the following accounts are available for testing:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@budgetmonitor.gov.in` | `Password@123` | Full access to users, audit logs, thresholds, and master controls |
| **Finance Officer** | `finance@budgetmonitor.gov.in` | `Password@123` | Multi-scheme financial authorization and anomaly resolution |
| **Education Dept Head** | `education.head@budgetmonitor.gov.in` | `Password@123` | Samagra Shiksha & PM-POSHAN expenditure tracking |
| **Health Dept Head** | `health.head@budgetmonitor.gov.in` | `Password@123` | National Health Mission (NHM) fund management |
| **Rural Dev Head** | `rural.head@budgetmonitor.gov.in` | `Password@123` | PMGSY rural road infrastructure voucher management |
| **Citizen Viewer** | `user@budgetmonitor.gov.in` | `Password@123` | Public fiscal dashboard and transparency scorecards |

---

## 📄 License & Attribution

This project is licensed under the terms of the **[MIT License](LICENSE)**.

**Created & Maintained by**:
**[Subhradeep Kundu](https://github.com/subhradeepkundu270305)**
