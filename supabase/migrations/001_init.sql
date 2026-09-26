-- ============================================================
-- TEAM LEGENDS BANK (TLB) LOS — Supabase PostgreSQL Schema
-- Migration: 001_init
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: users
-- One row per registered user (linked to Firebase Auth UID)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid        TEXT UNIQUE NOT NULL,
    full_name           TEXT NOT NULL,
    email               TEXT UNIQUE NOT NULL,
    phone               TEXT,
    pan_number          TEXT UNIQUE,
    account_no          TEXT,
    employment_type     TEXT DEFAULT 'Salaried',
    working_sector      TEXT DEFAULT 'PRIVATE_CORPORATE',
    monthly_income      NUMERIC(15, 2),
    role                TEXT DEFAULT 'applicant' CHECK (role IN ('applicant', 'underwriter', 'admin')),
    is_active           BOOLEAN DEFAULT TRUE,
    email_verified      BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLE: loan_applications
-- One row per submitted loan application
-- ============================================================
CREATE TABLE IF NOT EXISTS loan_applications (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_ref             TEXT UNIQUE NOT NULL,
    user_id                     UUID REFERENCES users(id) ON DELETE SET NULL,
    applicant_name              TEXT NOT NULL,
    applicant_age               INT,
    pan_number                  TEXT NOT NULL,
    account_no                  TEXT NOT NULL,
    employment_type             TEXT,
    working_sector              TEXT,
    working_sector_label        TEXT,
    monthly_income              NUMERIC(15, 2),
    loan_amount_requested       NUMERIC(15, 2),
    loan_tenor_months           INT,
    loan_purpose                TEXT,

    -- Credit risk metrics (computed)
    cibil_score                 INT,
    cibil_grade                 TEXT,
    dti_ratio                   TEXT,
    revolving_utilization_pct   NUMERIC(5, 2),
    qsvm_prediction             INT,
    risk_index                  INT,

    -- Decision fields
    status                      TEXT DEFAULT 'SUBMITTED'
                                    CHECK (status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','DECLINED','CONDITIONAL')),
    decision                    TEXT CHECK (decision IN ('APPROVED','DECLINED','CONDITIONAL')),
    decision_title              TEXT,
    decision_badge              TEXT,
    underwriting_tier           TEXT,
    sanctioned_amount           NUMERIC(15, 2),
    approved_rate               TEXT,
    approved_rate_benchmark     TEXT,
    approved_emi                TEXT,
    reasons                     JSONB DEFAULT '[]',

    -- Retirement/sector analysis
    statutory_retirement_age    INT,
    service_runway_years        INT,
    age_at_maturity             NUMERIC(5, 1),
    maturity_exceeds_retirement BOOLEAN DEFAULT FALSE,
    pension_eligible            BOOLEAN DEFAULT FALSE,

    -- Timestamps
    submitted_at                TIMESTAMPTZ DEFAULT now(),
    decided_at                  TIMESTAMPTZ,
    reviewed_by                 UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: loan_facilities
-- Past/active loan records entered by applicant per application
-- ============================================================
CREATE TABLE IF NOT EXISTS loan_facilities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id      UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    lender              TEXT,
    type                TEXT,
    sanctioned_amount   NUMERIC(15, 2),
    outstanding_balance NUMERIC(15, 2),
    monthly_emi         NUMERIC(15, 2),
    tenor_months        INT,
    emis_paid           INT,
    status              TEXT,
    dpd_status          TEXT
);

-- ============================================================
-- TABLE: audit_log
-- Every significant action is logged for compliance
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_uid       TEXT,                           -- Firebase UID
    actor_email     TEXT,
    action          TEXT NOT NULL,                  -- LOGIN | SUBMIT | REVIEW | APPROVE | DECLINE | LOGOUT
    target_ref      TEXT,                           -- application_ref if applicable
    ip_address      TEXT,
    user_agent      TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid       ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_pan                ON users(pan_number);
CREATE INDEX IF NOT EXISTS idx_apps_user_id             ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_status              ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_submitted_at        ON loan_applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_facilities_app_id        ON loan_facilities(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor              ON audit_log(actor_uid);
CREATE INDEX IF NOT EXISTS idx_audit_created            ON audit_log(created_at DESC);

-- ============================================================
-- AUTO-UPDATE updated_at trigger for users
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (Supabase RLS)
-- Only service-role key bypasses these rules.
-- The backend always uses the service-role key.
-- ============================================================
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_facilities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log           ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by backend only)
-- No anon/public access to any table
