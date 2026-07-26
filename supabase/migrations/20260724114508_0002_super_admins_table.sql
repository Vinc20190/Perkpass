/*
# Create super_admins table for platform-level access control

1. New Table
   - `super_admins` — stores the email and role of authorized super admin users.
   - `email` (text, unique, not null) — must match the auth.users email for access.
   - `role` (text, not null, default 'super_admin') — allows future role granularity.
   - `is_active` (boolean, default true) — can deactivate admins without deleting.
   - `created_at` (timestamptz).

2. Security
   - RLS enabled on super_admins.
   - SELECT policy: only authenticated users whose email exists in super_admins
     AND is_active = true can read the table. This lets the middleware verify
     access server-side by querying with the user's session.
   - No INSERT/UPDATE/DELETE policies for authenticated users — all mutations
     go through the service role key (edge function / migration only). This
     prevents any client from self-promoting to super admin.

3. Seed Data
   - Four emails seeded as active super_admins:
     vincentnogue2@gmail.com, vincentnogue@yahoo.com,
     webdxb1@gmail.com, liyahjoha@gmail.com

4. Important Notes
   - Access to /super-admin is verified server-side (middleware + edge function).
   - The edge function checks the super_admins table via service role key.
   - Client-side checks are for UX only; server-side is the real gate.
*/

CREATE TABLE IF NOT EXISTS super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'super_admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Only an authenticated user whose own email is in super_admins can SELECT
DROP POLICY IF EXISTS "select_self_if_super_admin" ON super_admins;
CREATE POLICY "select_self_if_super_admin"
ON super_admins FOR SELECT TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND is_active = true
);

-- No INSERT/UPDATE/DELETE policies — mutations only via service role

-- Seed the four authorized super admin emails
INSERT INTO super_admins (email, role, is_active)
VALUES
  ('vincentnogue2@gmail.com', 'super_admin', true),
  ('vincentnogue@yahoo.com', 'super_admin', true),
  ('webdxb1@gmail.com', 'super_admin', true),
  ('liyahjoha@gmail.com', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;
