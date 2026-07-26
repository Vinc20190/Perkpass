# PerkPass — Cloudflare Pages Deployment

## Build & Deploy

This project deploys to Cloudflare Pages as a static site.

### Option A: Cloudflare Dashboard (recommended)

1. Run `npm run build` locally to verify everything compiles.
2. Log in to Cloudflare → **Workers & Pages** → **Create application** → **Pages**.
3. Connect your Git repository (or use **Direct Upload**).
4. Set the build configuration:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node version:** 18 or 20
5. Add environment variables (copy from your `.env`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**.

### Option B: Wrangler CLI

```bash
npm run build
npx wrangler pages deploy out --project-name perkpass
```

### Option C: Direct Upload

1. Run `npm run build`.
2. Download the `out/` folder.
3. In Cloudflare Pages dashboard, use **Direct Upload** to drag-and-drop the `out/` folder.

## Notes

- The middleware (super-admin protection) runs as a Cloudflare Pages Function automatically.
- Supabase environment variables must be set in the Cloudflare dashboard under **Settings → Environment variables**.
- Custom domains can be attached in Cloudflare under **Custom domains** for the Pages project.
