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
    const { method } = req;
    const url = new URL(req.url);

    if (method === "POST" && url.pathname.endsWith("/checkout")) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        return new Response(JSON.stringify({ error: "Stripe is not configured. Add STRIPE_SECRET_KEY to edge function secrets." }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { priceId, companyId, companyName, customerEmail } = body;

      if (!priceId || !companyId) {
        return new Response(JSON.stringify({ error: "Missing priceId or companyId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const Stripe = (await import("npm:stripe")).default;
      const stripe = new Stripe(stripeKey);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: customerEmail,
        success_url: `${body.origin}/corporate/dashboard/settings?checkout=success`,
        cancel_url: `${body.origin}/corporate/dashboard/settings?checkout=cancelled`,
        metadata: { companyId, companyName },
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST" && url.pathname.endsWith("/webhook")) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!stripeKey || !webhookSecret) {
        return new Response(JSON.stringify({ error: "Stripe webhook not configured" }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const Stripe = (await import("npm:stripe")).default;
      const stripe = new Stripe(stripeKey);
      const sig = req.headers.get("stripe-signature");
      if (!sig) return new Response("Missing signature", { status: 400 });

      const rawBody = await req.text();
      const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { companyId } = session.metadata;
        if (companyId) {
          await fetch(`${supabaseUrl}/rest/v1/company_subscriptions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              company_id: companyId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              stripe_price_id: session.line_items?.data?.[0]?.price?.id,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }),
          });
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
