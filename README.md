# Fast-Restro

A restaurant ordering system in three parts: an API, a dashboard the restaurant
runs on a phone, and a menu customers order from without signing up.

| Folder | What it is | Runs on |
| --- | --- | --- |
| `react-quick-restro-api` | REST API, MongoDB, Socket.IO | `http://localhost:3000` |
| `restro-dashboard` | Restaurant dashboard (React + Vite) | `http://localhost:5173` |
| `food-court` | Customer ordering app (React + Vite) | `http://localhost:5174` |

## What it does

**For the restaurant** — a mobile-first dashboard with bottom navigation.

- Orders arrive live. A popup with a chime shows each new order, with Accept and
  Reject, and a browser notification when the tab is in the background.
- Orders are grouped into New, Preparing and Done, each one a card with large
  buttons rather than a table.
- Inventory has one-tap stock steppers that save on their own, and items can be
  added with a photo taken on the phone camera.
- Categories are free text, so each restaurant names its own menu sections.
- The account page holds the restaurant's details, logo, payment QR and UPI ID,
  plus the shareable link to its customer menu.

**For the customer** — no account, no sign-up.

- The menu opens at `/menu/<restaurantId>` with one-tap category switching.
- Orders are tracked live at `/order/<orderId>`, with a progress strip and a
  bar at the bottom of every page while an order is unfinished.
- Payment by UPI deep link (which opens GPay, PhonePe or Paytm with the amount
  filled in) or by scanning the restaurant's QR code.
- An order can be cancelled only until the restaurant accepts it; the API
  enforces that, not just the page.
- A PDF receipt can be downloaded once the order is completed.
- Browser notifications follow an order until it is completed or cancelled,
  then stop until the next order from that browser.

## Running it locally

You need Node.js 18+ and MongoDB.

**1. Start MongoDB**

```bash
mongod --dbpath /path/to/a/data/folder
```

**2. API**

```bash
cd react-quick-restro-api
npm install
cp config.env.example config.env   # then set SECRET to a random string
npm start
```

**3. Dashboard**

```bash
cd restro-dashboard
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

`--legacy-peer-deps` is needed because `react-day-picker@8` does not accept
`date-fns@4`.

**4. Customer app**

```bash
cd food-court
npm install --legacy-peer-deps
cp .env.example .env.local
npx vite --port 5174
```

**5. Sample data (optional)**

```bash
cd react-quick-restro-api
node seed.js
```

This creates one demo restaurant with a few menu items. The demo login is at
the top of `seed.js` — change it before using this anywhere real.

## Notes

- Images (logos, payment QR codes, menu photos) are stored on the API host
  under `uploads/` and served as static files, so no Cloudinary account is
  needed. That folder is not committed.
- Live updates use Socket.IO. The browser joins a room per restaurant or per
  order, so a customer only receives their own order's updates.
- Customer notifications arrive while the site is open in a tab, including a
  background tab. Reaching a fully closed browser would need Web Push with a
  service worker.
