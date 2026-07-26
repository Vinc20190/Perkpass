/*
# PerkPass — Core Multi-Tenant Schema (restructured)

Creates ALL tables first, then adds RLS policies to avoid circular
dependencies between companies and company_members.

1. New Tables (all created before any policies)
   - countries, exchange_rates (public reference)
   - companies, company_members, departments, employees
   - rewards_catalog, reward_assignments
   - notifications, audit_logs

2. Security
   - RLS enabled on every table.
   - Public read on countries + exchange_rates.
   - Tenant isolation via company_members membership checks.

3. Seed data
   - 16 African countries + USD-pivot exchange rates.
*/

-- ============================================================
-- TABLES (all created first)
-- ============================================================
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_code char(2) UNIQUE NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  currency_code char(3) NOT NULL,
  currency_symbol text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  phone_prefix text,
  flag_emoji text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code char(3) NOT NULL,
  rate_to_usd numeric(18,8) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (currency_code)
);

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  brand_color text DEFAULT '#F96324',
  address text,
  email text,
  phone text,
  vat_number text,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC',
  default_language text NOT NULL DEFAULT 'en',
  annual_budget_cents bigint NOT NULL DEFAULT 0,
  monthly_budget_cents bigint NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT 'starter',
  plan_status text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'employee',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  head_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  position text,
  status text NOT NULL DEFAULT 'active',
  avatar_url text,
  hired_at date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rewards_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  category text NOT NULL DEFAULT 'custom',
  value_cents bigint NOT NULL DEFAULT 0,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  expires_at timestamptz,
  conditions text,
  stock integer,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES rewards_catalog(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'available',
  qr_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  short_code text NOT NULL,
  value_cents bigint NOT NULL DEFAULT 0,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  message text,
  scheduled_for timestamptz,
  expires_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS ENABLE (all tables)
-- ============================================================
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES
-- ============================================================

-- Countries: public read
DROP POLICY IF EXISTS "public_read_countries" ON countries;
CREATE POLICY "public_read_countries"
ON countries FOR SELECT
TO anon, authenticated USING (true);

-- Exchange rates: public read
DROP POLICY IF EXISTS "public_read_exchange_rates" ON exchange_rates;
CREATE POLICY "public_read_exchange_rates"
ON exchange_rates FOR SELECT
TO anon, authenticated USING (true);

-- Companies: member-scoped
DROP POLICY IF EXISTS "select_company_if_member" ON companies;
CREATE POLICY "select_company_if_member"
ON companies FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_company_as_owner" ON companies;
CREATE POLICY "insert_company_as_owner"
ON companies FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_company_if_member_admin" ON companies;
CREATE POLICY "update_company_if_member_admin"
ON companies FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin')))
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin')));

-- Company members
DROP POLICY IF EXISTS "select_members_own_company" ON company_members;
CREATE POLICY "select_members_own_company"
ON company_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_member_self_or_admin" ON company_members;
CREATE POLICY "insert_member_self_or_admin"
ON company_members FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr')));

DROP POLICY IF EXISTS "update_member_if_admin" ON company_members;
CREATE POLICY "update_member_if_admin"
ON company_members FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin')))
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin')));

DROP POLICY IF EXISTS "delete_member_if_admin" ON company_members;
CREATE POLICY "delete_member_if_admin"
ON company_members FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin')));

-- Departments
DROP POLICY IF EXISTS "select_departments_own_company" ON departments;
CREATE POLICY "select_departments_own_company"
ON departments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = departments.company_id AND cm.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_departments_if_admin" ON departments;
CREATE POLICY "insert_departments_if_admin"
ON departments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = departments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')));

DROP POLICY IF EXISTS "update_departments_if_admin" ON departments;
CREATE POLICY "update_departments_if_admin"
ON departments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = departments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr')))
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = departments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr')));

DROP POLICY IF EXISTS "delete_departments_if_admin" ON departments;
CREATE POLICY "delete_departments_if_admin"
ON departments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = departments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin')));

-- Employees
DROP POLICY IF EXISTS "select_employees_own_company" ON employees;
CREATE POLICY "select_employees_own_company"
ON employees FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = employees.company_id AND cm.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_employees_if_admin" ON employees;
CREATE POLICY "insert_employees_if_admin"
ON employees FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = employees.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')));

DROP POLICY IF EXISTS "update_employees_if_admin" ON employees;
CREATE POLICY "update_employees_if_admin"
ON employees FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = employees.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')))
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = employees.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')));

DROP POLICY IF EXISTS "delete_employees_if_admin" ON employees;
CREATE POLICY "delete_employees_if_admin"
ON employees FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = employees.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr')));

-- Rewards catalog
DROP POLICY IF EXISTS "select_rewards_own_company" ON rewards_catalog;
CREATE POLICY "select_rewards_own_company"
ON rewards_catalog FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = rewards_catalog.company_id AND cm.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_rewards_if_admin" ON rewards_catalog;
CREATE POLICY "insert_rewards_if_admin"
ON rewards_catalog FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = rewards_catalog.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')));

DROP POLICY IF EXISTS "update_rewards_if_admin" ON rewards_catalog;
CREATE POLICY "update_rewards_if_admin"
ON rewards_catalog FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = rewards_catalog.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')))
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = rewards_catalog.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')));

DROP POLICY IF EXISTS "delete_rewards_if_admin" ON rewards_catalog;
CREATE POLICY "delete_rewards_if_admin"
ON rewards_catalog FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = rewards_catalog.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr')));

-- Reward assignments
DROP POLICY IF EXISTS "select_assignments_own_company" ON reward_assignments;
CREATE POLICY "select_assignments_own_company"
ON reward_assignments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = reward_assignments.company_id AND cm.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_assignments_if_admin" ON reward_assignments;
CREATE POLICY "insert_assignments_if_admin"
ON reward_assignments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = reward_assignments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')));

DROP POLICY IF EXISTS "update_assignments_if_admin" ON reward_assignments;
CREATE POLICY "update_assignments_if_admin"
ON reward_assignments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = reward_assignments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')))
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = reward_assignments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr','manager')));

DROP POLICY IF EXISTS "delete_assignments_if_admin" ON reward_assignments;
CREATE POLICY "delete_assignments_if_admin"
ON reward_assignments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = reward_assignments.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin','hr')));

-- Notifications: user-scoped
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications"
ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications"
ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications"
ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications"
ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Audit logs: admin read, member insert
DROP POLICY IF EXISTS "select_audit_own_company" ON audit_logs;
CREATE POLICY "select_audit_own_company"
ON audit_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = audit_logs.company_id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin')));

DROP POLICY IF EXISTS "insert_audit_own_company" ON audit_logs;
CREATE POLICY "insert_audit_own_company"
ON audit_logs FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM company_members cm WHERE cm.company_id = audit_logs.company_id AND cm.user_id = auth.uid()));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_rewards_company ON rewards_catalog(company_id);
CREATE INDEX IF NOT EXISTS idx_assignments_company ON reward_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON reward_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignments_qr_token ON reward_assignments(qr_token);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_logs(company_id);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO countries (iso_code, name, region, currency_code, currency_symbol, locale, phone_prefix, flag_emoji)
VALUES
  ('NG','Nigeria','West Africa','NGN','NGN','en','+234','NG'),
  ('KE','Kenya','East Africa','KES','KSh','en','+254','KE'),
  ('GH','Ghana','West Africa','GHS','GHS','en','+233','GH'),
  ('ZA','South Africa','Southern Africa','ZAR','ZAR','en','+27','ZA'),
  ('EG','Egypt','North Africa','EGP','EGP','ar','+20','EG'),
  ('MA','Morocco','North Africa','MAD','MAD','fr','+212','MA'),
  ('UG','Uganda','East Africa','UGX','UGX','en','+256','UG'),
  ('RW','Rwanda','East Africa','RWF','RWF','en','+250','RW'),
  ('CI','Cote dIvoire','West Africa','XOF','XOF','fr','+225','CI'),
  ('SN','Senegal','West Africa','XOF','XOF','fr','+221','SN'),
  ('CM','Cameroon','Central Africa','XAF','XAF','fr','+237','CM'),
  ('ET','Ethiopia','East Africa','ETB','ETB','am','+251','ET'),
  ('TZ','Tanzania','East Africa','TZS','TZS','sw','+255','TZ'),
  ('AO','Angola','Central Africa','AOA','AOA','pt','+244','AO'),
  ('DZ','Algeria','North Africa','DZD','DZD','ar','+213','DZ'),
  ('TN','Tunisia','North Africa','TND','TND','ar','+216','TN')
ON CONFLICT (iso_code) DO NOTHING;

INSERT INTO exchange_rates (currency_code, rate_to_usd)
VALUES
  ('USD',1.0),
  ('NGN',0.00067),
  ('KES',0.0075),
  ('GHS',0.077),
  ('ZAR',0.053),
  ('EGP',0.021),
  ('MAD',0.099),
  ('UGX',0.00026),
  ('RWF',0.00077),
  ('XOF',0.0016),
  ('XAF',0.0016),
  ('ETB',0.0085),
  ('TZS',0.00038),
  ('AOA',0.0011),
  ('DZD',0.0074),
  ('TND',0.32)
ON CONFLICT (currency_code) DO NOTHING;