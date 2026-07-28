# Aquilar Group — Static Site

Pure **HTML / CSS / JS** corporate site with **Three.js** visuals.  
No Node, no build step, no Nginx reverse proxy.

## Local preview (required for Three.js)

ES modules + Three.js **will not load** if you double-click the HTML file (`file://`). Use a tiny local server:

```powershell
cd C:\Users\DoD_Admin\Aquilar_Group\site
npx --yes serve .
```

Open **http://localhost:3000**

You need internet once so the browser can load Three.js from the CDN.

### Page visuals (Three.js)

| Page | Animation |
|------|-----------|
| Home | Rotating network globe + links |
| Systems | Floating architecture cubes / data packets |
| Operations | Top-down radar formation sweep |
| Contact | Uplink relay / signal graph |

## Structure

```
site/
  index.html          Home + Three.js globe
  systems.html        Systems + Three.js architecture
  operations.html     Ops / capture / BD
  contact.html        Contact form (mailto)
  404.html
  css/styles.css
  js/main.js          Nav, clock, form
  js/globe.js         Three.js network globe
  js/architecture.js  Three.js node field
  assets/
```

## Easiest deploy: Cloudflare Pages (free)

You already use Cloudflare for DNS — this is the path of least resistance.

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select `misterdallas/aquilargroup`
3. Build settings:

| Setting | Value |
|---------|--------|
| **Production branch** | `main` |
| **Root directory** | `site` |
| **Build command** | *(leave empty)* |
| **Build output directory** | `/` or leave empty (files already in `site`) |

If the UI asks for output directory when root is `site`, use `.` or `/`.

4. **Save and Deploy**
5. You’ll get `https://something.pages.dev`
6. **Custom domains** → add `aquilargroup.com` and `www`  
   Cloudflare will set DNS for you (same account = one click).

No Droplet. No PM2. No Certbot. HTTPS automatic.

## DigitalOcean App Platform (static, free tier)

1. Create App → GitHub → `aquilargroup` / `main`
2. Resource type: **Static Site**
3. **Source directory:** `site`
4. **Build command:** leave empty  
5. **Output directory:** `.`  
6. Deploy → use the `ondigitalocean.app` URL  
7. Point domain CNAME in Cloudflare when ready

## Droplet / any Nginx (simple static)

If you still have a droplet, skip Node entirely:

```nginx
server {
    listen 80;
    server_name aquilargroup.com www.aquilargroup.com;
    root /var/www/aquilargroup/site;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
cd /var/www/aquilargroup
git pull
# no npm install / build needed
sudo systemctl reload nginx
```

## GitHub Pages

Settings → Pages → Deploy from branch → folder `/site` (or `/docs` if you move files).

---

© Aquilar Group, LLC
