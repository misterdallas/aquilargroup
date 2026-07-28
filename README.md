# Aquilar Group, LLC

Defense contracting & consulting website — **static HTML** (easy deploy) with Three.js visuals.

**Primary site (use this):** [`site/`](./site/)

| Page | File |
|------|------|
| Home | `site/index.html` |
| Systems | `site/systems.html` |
| Operations | `site/operations.html` |
| Contact | `site/contact.html` |

## Why static?

- No Node server, no PM2, no reverse-proxy debugging  
- Free hosting on **Cloudflare Pages** (you already use Cloudflare)  
- Three.js globe + architecture scenes via CDN  
- Edit HTML/CSS/JS and push to GitHub  

The older Next.js app under `src/` is **legacy** (optional to delete later). Deploy **`site/`** only.

## Local preview

```powershell
cd C:\Users\DoD_Admin\Aquilar_Group\site
npx --yes serve .
```

Open **http://localhost:3000**

Or open `site/index.html` in a browser (CDN must load for Three.js).

## Deploy in ~10 minutes (Cloudflare Pages — recommended)

1. Push this repo to GitHub (`misterdallas/aquilargroup`)
2. Cloudflare → **Workers & Pages** → **Create** → **Pages** → connect GitHub
3. Project settings:
   - **Root directory:** `site`
   - **Build command:** *(empty)*
   - **Output directory:** `/` or `.`
4. Deploy → preview URL works immediately  
5. **Custom domains** → `aquilargroup.com`

Full notes: [`site/README.md`](./site/README.md)

## Brand

- Background `#0A0A0A` · Accent `#FF5A00` · Cream `#E8E0D0`  
- Design references in `Design_Images/`  
- Motto: Aim High · Elevate the System  

---

Designed for uninterrupted operation. Redundant systems maintain flight integrity.
