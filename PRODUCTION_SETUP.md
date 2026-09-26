# TEAM LEGENDS BANK (TLB) — Production Setup & Operations Manual

This document provides complete instructions for configuring and running the **TEAM LEGENDS BANK (TLB) Loan Origination System (LOS)** in production.

---

## 1. Architecture Overview

```
                         [ Vercel CDN & Edge ]
                         ┌────────────────────┐
                         │  index.html / CSS  │
                         │  app.js / i18n.js  │
                         │  firebase-auth.js  │
                         └─────────┬──────────┘
                                   │ /api/*
                                   ▼
                   [ Vercel Serverless (Python 3.11) ]
                   ┌─────────────────────────────────┐
                   │  api/main.py (FastAPI App)      │
                   │  ├── api/auth/register.py       │
                   │  ├── api/auth/me.py             │
                   │  ├── api/my_applications.py     │
                   │  ├── api/admin/applications.py  │
                   │  └── api/admin/review.py        │
                   └───────┬──────────────┬──────────┘
                           │              │
        ┌──────────────────┴──┐        ┌──┴──────────────────┐
        ▼                     ▼        ▼                     ▼
[ Supabase PostgreSQL ]  [ Firebase ] [ QSVM Engine ]  [ TransUnion CIBIL ]
- users                  Admin SDK    Qiskit Statevec  Live Credit Pull
- loan_applications      JWT Auth     Kernel Classif.  (Commercial API)
- loan_facilities        Email/Pass   models/
- audit_log              OTP          quantum_qsvc
```

---

## 2. Step 1: Supabase Database Setup

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project (e.g., `apex-bank-los`). Select Mumbai (`ap-south-1`) for lowest latency in India.
3. In the Supabase dashboard, navigate to **SQL Editor** -> **New Query**.
4. Copy the entire contents of [`supabase/migrations/001_init.sql`](file:///c:/Users/simso/OneDrive/Desktop/hack/q-credit/supabase/migrations/001_init.sql) and click **Run**.
5. Verify that four tables are created:
   - `users`
   - `loan_applications`
   - `loan_facilities`
   - `audit_log`
6. Go to **Project Settings** -> **API**:
   - Copy the **Project URL** -> `SUPABASE_URL`
   - Copy the **`service_role` Secret** (reveal it) -> `SUPABASE_SERVICE_ROLE_KEY`
   > [!CAUTION]
   > Never expose `service_role` in frontend code. It is only configured on the backend serverless environment.

---

## 3. Step 2: Firebase Authentication Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Go to **Build** -> **Authentication** -> **Get Started**.
3. Under **Sign-in method**, enable **Email/Password**.
4. Register a Web App:
   - Go to **Project Settings** (gear icon) -> **General** -> **Your apps** -> **Add app** (Web `</>`).
   - Copy the `firebaseConfig` object and paste its values into [`app/static/firebase-auth.js`](file:///c:/Users/simso/OneDrive/Desktop/hack/q-credit/app/static/firebase-auth.js):
     ```javascript
     const FIREBASE_CONFIG = {
       apiKey: "AIza...",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "1234567890",
       appId: "1:1234567890:web:abcdef"
     };
     ```
5. Generate Backend Service Account Key:
   - Go to **Project Settings** -> **Service accounts** tab.
   - Click **Generate new private key**.
   - For local development: save the file as `firebase-service-account.json` in the project root.
   - For Vercel production: minify the JSON file into a single line string and set it as `FIREBASE_SERVICE_ACCOUNT_JSON`.

---

## 4. Step 3: Vercel Deployment

1. Install the Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```
2. In the project root (`c:\Users\simso\OneDrive\Desktop\hack\q-credit`):
   ```bash
   vercel
   ```
3. Set the Environment Variables in the Vercel Dashboard (**Settings** -> **Environment Variables**):

| Variable Name | Value Description |
|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret key |
| `FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Minified single-line service account JSON |
| `ADMIN_SECRET_TOKEN` | Custom secure token (default: `TLB-SECURE-TOKEN-UNDERWRITER-2026`) |
| `ADMIN_USERNAME` | Production Admin Username |
| `ADMIN_PASSWORD` | Production Admin Password |
| `CIBIL_API_KEY` | Commercial API key (leave blank to use internal engine) |
| `CIBIL_API_URL` | Bureau URL (default: `https://api.cibil.com/v2`) |

4. Deploy to Production:
   ```bash
   vercel --prod
   ```

---

## 5. Step 4: CIBIL / Experian Credit Bureau API

The system contains an enterprise interface to TransUnion CIBIL and Experian India in [`lib/cibil.py`](file:///c:/Users/simso/OneDrive/Desktop/hack/q-credit/lib/cibil.py).

- **With Commercial License:** Set `CIBIL_API_KEY` in environment variables. The API will automatically pull real CIBIL credit scores and default reports during appraisal.
- **Without Commercial License:** The system seamlessly falls back to its deterministic analytical scoring engine based on the applicant's entered repayment history (30/60/90 DPD, NPAs, and revolving credit utilization).

---

## 6. Local Development Run

To run the full production server locally:
```powershell
# 1. Install production dependencies
pip install -r requirements-prod.txt

# 2. Configure .env file
cp .env.example .env
# Fill in your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# 3. Start production server
python api/main.py
```
Server starts on `http://127.0.0.1:8080`.
