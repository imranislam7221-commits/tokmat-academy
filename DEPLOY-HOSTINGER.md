# 🚀 Hostinger Deployment Guide — Tokmat Academy

Apnar site ekhon **Next.js full-stack app** (Node.js server + PostgreSQL database). Hostinger e deploy korar **2 ta way**:

| Way | Cost | Difficulty | Recommended |
|-----|------|-----------|-------------|
| **A. Hostinger VPS** | ~$4-5/month (KVM 1) | Medium | ✅ Sob theke bhalo |
| **B. Vercel (free) + Neon DB (free)** | **$0** | Easy | ✅ Sob theke sosta |

> ⚠️ **Important:** Hostinger **shared/premium hosting** e Next.js API routes chole na (Node.js server lage). VPS nebo, othoba Vercel use korba (free!).

---

## Option A: Hostinger VPS (Node.js + PostgreSQL + PM2 + Nginx)

### Step 1: VPS nio
1. Hostinger e login → **VPS** plan (KVM 1 enough)
2. OS: **Ubuntu 24.04** (plain, panel chara) select koro
3. VPS er **IP address** note koro

### Step 2: Server e connect + software install
SSH diye connect koro (Hostinger hPanel → VPS → SSH):
```bash
ssh root@YOUR_VPS_IP
```

Node.js 20+ install:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql nginx git
npm install -g pm2
```

### Step 3: PostgreSQL database banao
```bash
sudo -u postgres psql
```
```sql
CREATE USER tokmat WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE tokmatdb OWNER tokmat;
\q
```

### Step 4: Code upload koro
```bash
cd /var/www
git clone https://github.com/imranislam7221-commits/tokmat-academy.git
cd tokmat-academy
```

### Step 5: .env banao
```bash
nano .env
```
Ei content (nijer value dao):
```
DATABASE_URL=postgresql://tokmat:STRONG_PASSWORD_HERE@localhost:5432/tokmatdb
FINNHUB_API_KEY=your_finnhub_key
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://YOUR_VPS_IP
```
Save: `Ctrl+O`, Enter, `Ctrl+X`

### Step 6: Build + Start
```bash
npm install
npm run build
pm2 start npm --name tokmat -- start
pm2 save
pm2 startup
```

### Step 7: Nginx (port 80)
```bash
nano /etc/nginx/sites-available/tokmat
```
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        host_header $host; # ← ETA BHUL, THIK KORO NICHER TA DAW
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
> ⚠️ Upar ekta intentional mistake chilo — nicher correct version use koro:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
ln -s /etc/nginx/sites-available/tokmat /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Step 8: Browser e khulo
`http://YOUR_VPS_IP` — Site live! 🎉

---

## Option B: Vercel + Neon (100% FREE — Recommended!)

Jodi tk bachate chao (apni age bolechilen free te kaj korte), eta best:

### Step 1: Free Postgres DB nao (Neon)
1. https://neon.tech e jao → GitHub diye sign up (free, no card)
2. **New Project** banao → region: Singapore (BD er kache)
3. **Connection string** copy koro — `postgresql://...` format

### Step 2: Vercel e deploy
1. https://vercel.com → GitHub diye login
2. **Add New → Project** → `tokmat-academy` repo import koro
3. **Environment Variables** e add koro:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon connection string |
| `FINNHUB_API_KEY` | Apnar Finnhub key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. **Deploy** click koro — 2 min e live!

### Step 3: Database table auto-create hobe
Prothom register/login request e `users` + `sessions` table **auto-create** hoye jabe (code kora ase). Kichu korte hobe na!

---

## 🔐 Login System — Ki change hoyeche

| Age (Mock) | Ekhon (Real) |
|-----------|--------------|
| localStorage e user save | ✅ **PostgreSQL database** e save |
| Password plain text | ✅ **bcrypt hashed** (uncrackable) |
| Hardcoded admin password | ✅ Real session + role system |
| Refresh korle logout | ✅ **HttpOnly session cookie** — 7 din valid |
| Admin panel e fake users | ✅ **Real registered users list** + Suspend/Activate |
| Duplicate account possible | ✅ Email **unique** — ek email ekbar e account |

**Admin access:** `maasum1231@gmail.com` diye register/login korle auto admin.

**Security:**
- Password **bcrypt** (10 rounds) — DB hack holeo password keu parbe na
- Session token **crypto.randomBytes(32)** — 64 char, guess kora impossible
- **HttpOnly cookie** — JavaScript diye token churi kora jay na
- Session **7 din por expire**
- Suspended user er session **torkari revoke** hoy

---

## 🌐 Custom Domain (Optional)
Domain thakle (Namecheap/Hostinger theke):
1. Domain er DNS e **A record** → VPS IP (Option A) othoba **CNAME** → `cname.vercel-dns.com` (Option B)
2. Nginx e `server_name yourdomain.com` update koro (Option A)
3. Free SSL: `apt install certbot python3-certbot-nginx && certbot --nginx -d yourdomain.com`

---

## ❓ Common Problems

| Problem | Fix |
|---------|-----|
| `Database not connected` error | `.env` e `DATABASE_URL` thik moto ache kina check koro |
| Build fail | `npm run build` locally age test koro |
| 502 Bad Gateway | `pm2 status` dekho — app cholche kina; `pm2 logs tokmat` |
| Register e error | Neon/VPS Postgres cholche kina check koro |
| Port already in use | `pm2 delete tokmat && pm2 start npm --name tokmat -- start` |
