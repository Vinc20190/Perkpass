/*
# Fix infinite RLS recursion on company_members

## Problem
The SELECT/UPDATE/DELETE policies on `company_members` (and all tenant
tables that check membership) used `EXISTS (SELECT 1 FROM company_members ...)`.
Because the policy ON `company_members` itself queries `company_members`,
Postgres recurses into the same policy and aborts with:
  "infinite recursion detected in policy for relation company_members"

## Fix
1. Create a `SECURITY DEFINER` SQL function `is_company_member(company_uuid uuid)`
   that reads `company_members` with the owner role (bypassing RLS), so the
   membership lookup never re-enters the RLS policy loop.
2. Create `is_company_admin(company_uuid uuid)` and `is_company_writer(...)`
   for the role-aware variants used across the policies.
3. Recreate ALL policies on `company_members` and every tenant table to use
   these functions instead of inline `EXISTS (... FROM company_members ...)`.
   Policies are dropped first so the migration is idempotent.

## Security
- The helper functions are `SECURITY DEFINER`, owned by the migration role,
  and only return a boolean. They are `STABLE`, `LANGUAGE sql`, with no side
  effects — safe to call from RLS policies.
- All RLS table access remains authenticated-only and scoped to the user's
  company membership. No data is exposed more broadly than before.
*/

-- ============================================================
-- 1. Helper functions (SECURITY DEFINER → bypass RLS, no recursion)
-- ============================================================

-- Drop existing versions if re-running
DROP FUNCTION IF EXISTS is_company_member(uuid);
DROP FUNCTION IF EXISTS is_company_admin(uuid);
DROP FUNCTION IF EXISTS is_company_writer(uuid);

-- Membership check (any active member of the company)
CREATE OR REPLACE FUNCTION is_company_member(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = company_uuid
      AND user_id = auth.uid()
      AND is_active = true
  );
$$;

-- Admin-level check (owner or admin)
CREATE OR REPLACE FUNCTION is_company_admin(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = company_uuid
      AND user_id = auth.uid()
      AND is_active = true
      AND role IN ('owner','admin')
  );
$$;

-- Writer-level check (owner, admin, hr, manager)
CREATE OR REPLACE FUNCTION is_company_writer(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = company_uuid
      AND user_id = auth.uid()
      AND is_active = true
      AND role IN ('owner','admin','hr','manager')
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_company_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_writer(uuid) TO authenticated;

-- ============================================================
-- 2. Re-create company_members policies (no self-reference)
-- ============================================================
DROP POLICY IF EXISTS "select_members_own_company" ON company_members;
CREATE POLICY "select_members_own_company"
ON company_members FOR SELECT TO authenticated
USING (is_company_member(company_id));

DROP POLICY IF EXISTS "insert_member_self_or_admin" ON company_members;
CREATE POLICY "insert_member_self_or_admin"
ON company_members FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR is_company_writer(company_id));

DROP POLICY IF EXISTS "update_member_if_admin" ON company_members;
CREATE POLICY "update_member_if_admin"
ON company_members FOR UPDATE TO authenticated
USING (is_company_admin(company_id))
WITH CHECK (is_company_admin(company_id));

DROP POLICY IF EXISTS "delete_member_if_admin" ON company_members;
CREATE POLICY "delete_member_if_admin"
ON company_members FOR DELETE TO authenticated
USING (is_company_admin(company_id));

-- ============================================================
-- 3. Re-create companies policies
-- ============================================================
DROP POLICY IF EXISTS "select_company_if_member" ON companies;
CREATE POLICY "select_company_if_member"
ON companies FOR SELECT TO authenticated
USING (is_company_member(id));

DROP POLICY IF EXISTS "insert_company_as_owner" ON companies;
CREATE POLICY "insert_company_as_owner"
ON companies FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_company_if_member_admin" ON companies;
CREATE POLICY "update_company_if_member_admin"
ON companies FOR UPDATE TO authenticated
USING (is_company_admin(id))
WITH CHECK (is_company_admin(id));

-- ============================================================
-- 4. Re-create departments policies
-- ============================================================
DROP POLICY IF EXISTS "select_departments_own_company" ON departments;
CREATE POLICY "select_departments_own_company"
ON departments FOR SELECT TO authenticated
USING (is_company_member(company_id));

DROP POLICY IF EXISTS "insert_departments_if_admin" ON departments;
CREATE POLICY "insert_departments_if_admin"
ON departments FOR INSERT TO authenticated
WITH CHECK (is_company_writer(company_id));

DROP POLICY IF EXISTS "update_departments_if_admin" ON departments;
CREATE POLICY "update_departments_if_admin"
ON departments FOR UPDATE TO authenticated
USING (is_company_admin(company_id))
WITH CHECK (is_company_admin(company_id));

DROP POLICY IF EXISTS "delete_departments_if_admin" ON departments;
CREATE POLICY "delete_departments_if_admin"
ON departments FOR DELETE TO authenticated
USING (is_company_admin(company_id));

-- ============================================================
-- 5. Re-create employees policies
-- ============================================================
DROP POLICY IF EXISTS "select_employees_own_company" ON employees;
CREATE POLICY "select_employees_own_company"
ON employees FOR SELECT TO authenticated
USING (is_company_member(company_id));

DROP POLICY IF EXISTS "insert_employees_if_admin" ON employees;
CREATE POLICY "insert_employees_if_admin"
ON employees FOR INSERT TO authenticated
WITH CHECK (is_company_writer(company_id));

DROP POLICY IF EXISTS "update_employees_if_admin" ON employees;
CREATE POLICY "update_employees_if_admin"
ON employees FOR UPDATE TO authenticated
USING (is_company_writer(company_id))
WITH CHECK (is_company_writer(company_id));

DROP POLICY IF EXISTS "delete_employees_if_admin" ON employees;
CREATE POLICY "delete_employees_if_admin"
ON employees FOR DELETE TO authenticated
USING (is_company_admin(company_id));

-- ============================================================
-- 6. Re-create rewards_catalog policies
-- ============================================================
DROP POLICY IF EXISTS "select_rewards_own_company" ON rewards_catalog;
CREATE POLICY "select_rewards_own_company"
ON rewards_catalog FOR SELECT TO authenticated
USING (is_company_member(company_id));

DROP POLICY IF EXISTS "insert_rewards_if_admin" ON rewards_catalog;
CREATE POLICY "insert_rewards_if_admin"
ON rewards_catalog FOR INSERT TO authenticated
WITH CHECK (is_company_writer(company_id));

DROP POLICY IF EXISTS "update_rewards_if_admin" ON rewards_catalog;
CREATE POLICY "update_rewards_if_admin"
ON rewards_catalog FOR UPDATE TO authenticated
USING (is_company_writer(company_id))
WITH CHECK (is_company_writer(company_id));

DROP POLICY IF EXISTS "delete_rewards_if_admin" ON rewards_catalog;
CREATE POLICY "delete_rewards_if_admin"
ON rewards_catalog FOR DELETE TO authenticated
USING (is_company_admin(company_id));

-- ============================================================
-- 7. Re-create reward_assignments policies
-- ============================================================
DROP POLICY IF EXISTS "select_assignments_own_company" ON reward_assignments;
CREATE POLICY "select_assignments_own_company"
ON reward_assignments FOR SELECT TO authenticated
USING (is_company_member(company_id));

DROP POLICY IF EXISTS "insert_assignments_if_admin" ON reward_assignments;
CREATE POLICY "insert_assignments_if_admin"
ON reward_assignments FOR INSERT TO authenticated
WITH CHECK (is_company_writer(company_id));

DROP POLICY IF EXISTS "update_assignments_if_admin" ON reward_assignments;
CREATE POLICY "update_assignments_if_admin"
ON reward_assignments FOR UPDATE TO authenticated
USING (is_company_writer(company_id))
WITH CHECK (is_company_writer(company_id));

DROP POLICY IF EXISTS "delete_assignments_if_admin" ON reward_assignments;
CREATE POLICY "delete_assignments_if_admin"
ON reward_assignments FOR DELETE TO authenticated
USING (is_company_admin(company_id));

-- ============================================================
-- 8. Re-create audit_logs policies
-- ============================================================
DROP POLICY IF EXISTS "select_audit_own_company" ON audit_logs;
CREATE POLICY "select_audit_own_company"
ON audit_logs FOR SELECT TO authenticated
USING (is_company_admin(company_id));

DROP POLICY IF EXISTS "insert_audit_own_company" ON audit_logs;
CREATE POLICY "insert_audit_own_company"
ON audit_logs FOR INSERT TO authenticated
WITH CHECK (is_company_member(company_id));
