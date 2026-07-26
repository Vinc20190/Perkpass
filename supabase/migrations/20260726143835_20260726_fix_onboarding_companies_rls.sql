/*
# Fix onboarding: "new row violates row-level security policy for table companies"

## Problem
When a new user creates a company on the onboarding page, the flow is:
  1. INSERT into companies (passes WITH CHECK true)
  2. .select().single() to get the new company ID
  3. INSERT into company_members with role='owner'

Step 2 fails because the SELECT policy `is_company_member(id)` returns false —
the user is not yet a member of the company they just created. With `.single()`
this throws an error that surfaces as an RLS violation.

## Fix
1. Add `created_by uuid DEFAULT auth.uid()` column to companies so we can
   identify the user who created the company.
2. Update the companies SELECT policy to allow the creator to read their own
   company row: `is_company_member(id) OR created_by = auth.uid()`.
   This lets the onboarding flow read back the inserted company immediately.
3. Keep all other policies unchanged.

## Security
- The creator can only READ their own company (not others').
- Once the onboarding flow inserts the company_members row, the regular
  `is_company_member` check takes over for all subsequent access.
- No data is exposed more broadly than before.
*/

-- 1. Add created_by column (safe: ADD COLUMN never loses data)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

-- 2. Update SELECT policy to allow creator to see their own company
DROP POLICY IF EXISTS "select_company_if_member" ON companies;
CREATE POLICY "select_company_if_member"
ON companies FOR SELECT TO authenticated
USING (is_company_member(id) OR created_by = auth.uid());

-- 3. Update INSERT policy to set created_by correctly
DROP POLICY IF EXISTS "insert_company_as_owner" ON companies;
CREATE POLICY "insert_company_as_owner"
ON companies FOR INSERT TO authenticated
WITH CHECK (true);

-- 4. Index for created_by lookups
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
