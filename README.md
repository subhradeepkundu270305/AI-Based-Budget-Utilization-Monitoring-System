# AI-Based Budget Utilization Monitoring System

A full-stack MEAN (MongoDB + Express + Angular + Node.js) application for monitoring government scheme budget utilization with automated anomaly detection.

## Architecture

```
backend/   — Express REST API (Node.js + Mongoose)
frontend/  — Angular 19 SPA (standalone components, reactive forms, Chart.js)
```

## Prerequisites

| Dependency | Version |
|------------|---------|
| Node.js    | ≥ 20    |
| MongoDB    | ≥ 6 (running locally on port 27017) |
| npm        | ≥ 9     |

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env          # edit if needed (defaults work for local dev)
npm install
npm run seed                  # populate database with realistic data
npm run dev                   # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:4200
```

Open **http://localhost:4200** in your browser.

### All in one (from repo root)
```bash
# Terminal 1
cd backend && npm install && npm run seed && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

---

## Demo Credentials (after seeding)

All accounts share the password: **`Password@123`**

| Role | Email |
|------|-------|
| Admin | `admin@budgetmonitor.gov.in` |
| Finance Officer | `finance@budgetmonitor.gov.in` |
| Education Dept Head | `education.head@budgetmonitor.gov.in` |
| Rural Dev Head | `rural.head@budgetmonitor.gov.in` |
| Health Dept Head | `health.head@budgetmonitor.gov.in` |
| Roads Head | `roads.head@budgetmonitor.gov.in` |
| Housing Head | `housing.head@budgetmonitor.gov.in` |
| Water & Sanitation Head | `water.head@budgetmonitor.gov.in` |
| Agriculture Head | `agriculture.head@budgetmonitor.gov.in` |

---

## Seeded Anomalies

After seeding, trigger detection via the **Alerts** page → "Run detection" button (or `POST /api/monitoring/run`):

| Anomaly type | Budget | Reason |
|---|---|---|
| **UnderUtilization** | Samagra Shiksha FY 2025-26 (DSEL) | Only ~18% spent; period fully elapsed |
| **PaceDeviation** | National Health Mission FY 2026-27 (DHFW) | Very low spend rate vs ~47% of period elapsed |
| **Spike** | PMAY-U FY 2026-27 (MOHUA) | Single bulk voucher > 25% of remaining budget |

---

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/budget_utilization
JWT_ACCESS_SECRET=<at least 32 characters>
JWT_REFRESH_SECRET=<at least 32 characters>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
FRONTEND_ORIGIN=http://localhost:4200
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
UPLOAD_DIR=uploads
CRON_ENABLED=true
```

---

## API Routes

| Group | Prefix | Notes |
|-------|--------|-------|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `/logout` | JWT + httpOnly refresh cookie |
| Me | `GET /api/auth/me` | current user |
| Users | `/api/users` | Admin only |
| Departments | `/api/departments` | Read: all auth; Write: Admin |
| Budgets | `/api/budgets` | Write: Admin/FinanceOfficer |
| Expenditures | `/api/expenditures` | DeptHead: own dept only |
| Alerts | `/api/alerts` | Read: all auth; Resolve: Admin/FO |
| Reports | `/api/reports/dashboard`, `/departments`, `/export/pdf`, `/export/csv` | |
| Admin Thresholds | `/api/admin/thresholds` | Admin only |
| Admin Audit Logs | `/api/admin/audit-logs` | Admin only |
| Monitoring | `POST /api/monitoring/run` | Admin/FO; triggers anomaly engine |

---

## RBAC

| Feature | Admin | Finance Officer | Department Head |
|---------|-------|-----------------|-----------------|
| User management | ✅ | ❌ | ❌ |
| Department management | ✅ | ❌ | ❌ |
| Create/edit budgets | ✅ | ✅ | ❌ |
| Record expenditure | ✅ | ✅ | Own dept only |
| View reports | ✅ | All depts | Own dept only |
| Resolve alerts | ✅ | ✅ | ❌ |
| Threshold config | ✅ | ❌ | ❌ |
| Audit log | ✅ | ❌ | ❌ |

---

## Anomaly Detection Rules

Thresholds are configurable via the Admin Panel → Thresholds tab. Defaults:

| Rule | Condition |
|------|-----------|
| **Under-utilization** | Utilization < 40% AND time elapsed ≥ 70% of period |
| **Spending spike** | Single transaction > 25% of remaining budget |
| **Pace deviation** | Cumulative spend deviates > 20% from prorated expected spend |
| **Overspending** | Total spend exceeds allocated amount |

The engine runs daily at 02:00 (via `node-cron`) and on-demand via the API.

---

## Tech Stack

**Backend**
- Express 4, Mongoose 8, bcrypt, jsonwebtoken, multer, pdfkit, json2csv, node-cron, helmet, express-rate-limit, express-validator

**Frontend**
- Angular 19 (standalone), reactive forms, ng2-charts + Chart.js 4, Angular CDK

---

## Project Structure

```
backend/
  config/       env.js, db.js
  controllers/  auth, user, department, budget, expenditure, alert, report
  middleware/   auth.js, roleGuard.js, errorHandler.js, upload.js, validate.js
  models/       User, Department, Budget, Expenditure, Alert, AuditLog, ThresholdConfig, RefreshToken
  routes/       auth, user, department, budget, expenditure, alert, report
  services/     anomalyEngine.js
  seed/         seed.js
  utils/        tokens.js, audit.js, pagination.js, httpError.js
  server.js

frontend/src/app/
  core/         auth.service, api.service, auth.guard, role.guard, auth.interceptor, models
  shared/       shell.component, status-banner.component, inr.pipe
  features/
    auth/       login.component, register.component
    dashboard/  dashboard.component
    budgets/    budgets.component
    expenditures/ expenditures.component
    departments/  reports.component
    alerts/     alerts.component
    admin/      admin-panel.component
```
