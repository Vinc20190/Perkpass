import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    // Verify the caller is authenticated
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
    });
    const user = await userRes.json();

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check super_admins table via service role key
    const adminCheckRes = await fetch(
      `${supabaseUrl}/rest/v1/super_admins?email=eq.${encodeURIComponent(user.email)}&is_active=eq.true&select=id`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      }
    );
    const adminRows = await adminCheckRes.json();

    if (!adminRows || adminRows.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden — super admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to query all data
    const adminRes = await fetch(`${supabaseUrl}/rest/v1/companies?select=id,name,slug,plan,plan_status,is_active,trial_ends_at,created_at,updated_at`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const companies = await adminRes.json();

    // Count members per company
    const memberRes = await fetch(`${supabaseUrl}/rest/v1/company_members?select=company_id,user_id,role,is_active`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const members = await memberRes.json();

    const employeeRes = await fetch(`${supabaseUrl}/rest/v1/employees?select=company_id,status`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const allEmployees = await employeeRes.json();

    const assignRes = await fetch(`${supabaseUrl}/rest/v1/reward_assignments?select=company_id,status,value_cents`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const allAssignments = await assignRes.json();

    // Aggregate per company
    const companyStats = (companies as Record<string, unknown>[]).map((c) => {
      const cid = c.id as string;
      const compMembers = (members as Record<string, unknown>[]).filter((m) => m.company_id === cid);
      const compEmps = (allEmployees as Record<string, unknown>[]).filter((e) => e.company_id === cid);
      const compAssigns = (allAssignments as Record<string, unknown>[]).filter((a) => a.company_id === cid);
      const revenue = compAssigns.reduce((s, a) => s + (a.value_cents as number), 0);
      return {
        ...c,
        member_count: compMembers.length,
        employee_count: compEmps.length,
        active_employees: compEmps.filter((e) => e.status === "active").length,
        assignment_count: compAssigns.length,
        redeemed_count: compAssigns.filter((a) => a.status === "used").length,
        revenue_cents: revenue,
      };
    });

    // Global stats
    const totalCompanies = companies.length;
    const activeCompanies = (companies as Record<string, unknown>[]).filter((c) => c.is_active).length;
    const totalRevenue = companyStats.reduce((s, c) => s + (c.revenue_cents as number), 0);
    const totalEmployees = (allEmployees as Record<string, unknown>[]).length;
    const totalAssignments = (allAssignments as Record<string, unknown>[]).length;
    const trialCompanies = (companies as Record<string, unknown>[]).filter((c) => c.plan_status === "trial").length;

    // New companies per month (last 6)
    const now = new Date();
    const monthlyNew = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const count = (companies as Record<string, unknown>[]).filter((c) => {
        const cd = new Date(c.created_at as string);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      return { name: monthName, new_companies: count };
    });

    return new Response(JSON.stringify({
      companies: companyStats,
      stats: {
        total_companies: totalCompanies,
        active_companies: activeCompanies,
        trial_companies: trialCompanies,
        total_revenue_cents: totalRevenue,
        total_employees: totalEmployees,
        total_assignments: totalAssignments,
        total_users: (members as Record<string, unknown>[]).filter((m) => m.role === "owner").length,
      },
      monthly_new: monthlyNew,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
