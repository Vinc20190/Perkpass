/*
# Super Admin RLS: allow admins to manage admins

Currently super_admins only allows self-read. This adds:
- Super admins can SELECT all super_admins rows
- Super admins can INSERT and DELETE super_admins rows
*/

-- Drop existing self-read-only policy
DROP POLICY IF EXISTS "select_own_super_admin" ON super_admins;

-- Self read (user can check if they are admin)
CREATE POLICY "select_own_super_admin"
ON super_admins FOR SELECT TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Super admin can read all admins
DROP POLICY IF EXISTS "select_all_super_admins" ON super_admins;
CREATE POLICY "select_all_super_admins"
ON super_admins FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Super admin can insert new admins
DROP POLICY IF EXISTS "insert_super_admin" ON super_admins;
CREATE POLICY "insert_super_admin"
ON super_admins FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Super admin can delete admins
DROP POLICY IF EXISTS "delete_super_admin" ON super_admins;
CREATE POLICY "delete_super_admin"
ON super_admins FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Super admin can update admins (activate/deactivate)
DROP POLICY IF EXISTS "update_super_admin" ON super_admins;
CREATE POLICY "update_super_admin"
ON super_admins FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);
