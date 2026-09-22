# ShopEasy — E-Commerce Platform

Full-stack app: **React (Vite) + Flask + MySQL**.

## 1. Database

Open a MySQL shell (or MySQL Workbench) and run:

```sql
source backend/schema.sql;
```

This creates the `ecommerce` database and all tables (fresh install).

**If you already have the database set up** from before these new features
(ratings/wishlist/coupons/dashboard) were added, don't re-run `schema.sql`
(it would wipe your data) — instead run the migration, which only adds
what's new:

```powershell
Get-Content backend/migrate_v2.sql | mysql -u root -p ecommerce
```

## 2. Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Open `config.py` and set your MySQL `user` / `password`.

Seed sample data (4 categories, 20 products, an admin + a customer account):

```bash
python seed.py
```

Start the API:

```bash
python app.py
```

Runs at **http://localhost:5000**.

Demo logins created by `seed.py`:
| Role     | Email                | Password    |
|----------|-----------------------|-------------|
| Admin    | admin@example.com     | admin123    |
| Customer | customer@example.com  | customer123 |

## 3. Frontend (React + Vite)

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Runs at **http://localhost:5173** and talks to the API at `localhost:5000`
(cookies are sent cross-origin via `withCredentials: true` + Flask-CORS).

## 4. Try it out

1. Visit `http://localhost:5173`, browse products, filter/search/sort.
2. Register a new account (or log in as the demo customer), add items to
   the cart, check out with an address. Try coupon code `WELCOME10` or
   `SAVE20` (seeded automatically) at checkout.
3. After an order is delivered (or really, right away — the check is just
   "have you purchased this product"), go to the product page and leave a
   star rating + review.
4. Click the heart icon on any product to add it to your wishlist, and
   view it all at `/wishlist`.
5. Log in as the demo admin to add/edit/delete products, manage orders,
   manage coupons at `/admin/coupons`, and view the sales dashboard at
   `/admin`.

## New features (v5 - JWT authentication)

Auth is now stateless JWT instead of Flask sessions - this is a bigger
change than earlier upgrades, so read this section before testing.

- **`pip install flask-jwt-extended`** is a new backend dependency
  (already added to `requirements.txt`).
- `POST /api/login` and `POST /api/register` now return
  `{ access_token, refresh_token, user }` instead of setting a session
  cookie. Access tokens expire in 15 minutes; refresh tokens in 7 days.
- Every previously-session-protected route now uses `@login_required` /
  `@admin_required`, which are thin wrappers around flask-jwt-extended's
  `@jwt_required()` - same decorator names as before, so route code
  barely changed, but they now check a `Bearer` token in the
  `Authorization` header instead of a cookie.
- New `POST /api/refresh` route - exchanges a valid refresh token for a
  new access token.
- `GET /api/me` now requires a valid access token and returns the user
  object directly (`{ id, name, role }`), not wrapped in `{ user: ... }`.
- **Frontend**: `api.js` now attaches `Authorization: Bearer <token>` to
  every request via an Axios request interceptor, and a response
  interceptor automatically retries any request that comes back 401 by
  silently refreshing the access token first. If the refresh token has
  also expired, the user is logged out and sent to `/login`.
- Tokens live in `localStorage` (`access_token` / `refresh_token`).
  `AuthContext` restores the logged-in user on page refresh by calling
  `/api/me` if a token is present, so reloading the page no longer logs
  you out.
- No database changes. No new tables.

**One consequence to know about:** because access tokens now expire
after 15 minutes, staying logged in for longer than that no longer
"just works" via a cookie - it depends on the refresh flow actually
firing on the next API call after expiry. This is expected and correct
JWT behavior, not a bug: the interceptor handles it silently as long as
the refresh token (7-day lifetime) is still valid.

## New features (v4 - pagination + debounced search)

- **`GET /api/products`** now takes `?page=&limit=&search=&category=&sort=`
  and returns `{ products, total, page, limit, total_pages }` instead of a
  bare array. Uses `LIMIT`/`OFFSET` server-side, so only one page of rows
  is ever fetched.
- **`GET /api/orders`** (admin) takes `?page=&limit=` the same way, returning
  `{ orders, total, page, limit, total_pages }`.
- **`useDebounce` hook** (`src/hooks/useDebounce.js`) — the search input
  updates on every keystroke (no typing lag), but the value used to
  trigger an API call only updates 300ms after the user stops typing.
- **`Pagination` component** (`src/components/Pagination.jsx`) — Previous/
  Next buttons, numbered pages, current page highlighted. Used on the
  Home page (products, 8/page) and `/admin/orders` (10/page).
- Changing the search text, category, or sort on Home resets back to
  page 1 automatically.
- `AdminProducts.jsx` (the admin management table) isn't paginated per
  this task's spec, so it just requests a high `limit` to keep showing
  everything at once - it was updated only to unwrap the new response
  shape.

## New features (v3 - image upload upgrades)

- **Drag-and-drop upload** — the admin product form's image inputs are now
  a `DropzoneUpload` component: drag a file onto it, or click to browse.
- **Old file cleanup** — when a product's cover image is replaced, or the
  product is deleted, the old file(s) are removed from
  `backend/static/uploads/` on disk, not just unlinked in the database.
- **Product image gallery** — a `product_images` table holds extra photos
  per product. Manage them from the product's edit page (upload/delete
  each one); the product detail page shows a thumbnail strip that swaps
  the large image. Needs `migrate_v3.sql` if you're updating an existing
  database.
- **Upload progress** — both the cover image and gallery uploads show a
  live percentage bar via Axios's `onUploadProgress`.

## New features (v2)

- **Product ratings** — customers who've purchased a product can leave a
  1–5 star rating + optional review (`ratings` table). One rating per
  user per product; submitting again updates it.
- **Wishlist** — heart icon on any product card/detail page, backed by a
  `wishlist` table and a `WishlistContext` (same pattern as the cart).
- **Coupons** — `coupons` table with a code, discount %, active flag, and
  optional expiry. Validated live at checkout (`POST /api/coupons/validate`)
  and re-validated server-side when the order is placed, so a coupon can't
  be forged or reused after being deactivated. Admins manage coupons at
  `/admin/coupons`.
- **Low stock warnings** — any product with stock < 5 shows an amber
  "Only N left" badge on product cards, the detail page, and the admin
  product table. The dashboard also shows a running low-stock count.
- **Admin sales dashboard** (`/admin`) — total revenue (excluding
  cancelled orders), total order count, low-stock count, and a top-5
  best-selling products table by units sold.

## How the pieces fit together

- **CartContext** (`src/context/CartContext.jsx`) holds the cart in
  React state (persisted to `localStorage` so a refresh doesn't lose it).
  Any component calls `useCart()` to read/update it — no prop drilling.
- **AuthContext** (`src/context/AuthContext.jsx`) holds the logged-in
  user, backed by the Flask session cookie. `ProtectedRoute` and
  `AdminRoute` read `useAuth()` to guard pages.
- **Stock safety**: `POST /api/orders` first checks every item has
  enough stock, and only *after* every item passes does it create the
  order and decrement stock — so a failed order never partially reduces
  inventory.
- **Price history**: `order_items.unit_price` is copied from the
  product at order time, so later price changes never rewrite past
  orders.

## Notes / things you may want to extend

- Passwords are hashed with bcrypt; sessions are Flask's signed cookie
  sessions (fine for this project — swap for JWT if you need a
  stateless API later).
- `config.py` has DB credentials in plain text for simplicity — use
  environment variables before deploying anywhere real.
- Product images use placeholder URLs (picsum.photos) from `seed.py` —
  swap in real image URLs any time via the admin edit form.
