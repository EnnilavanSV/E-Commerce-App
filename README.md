# E-Commerce Application

A MERN storefront with product browsing, a database-backed cart, Razorpay checkout, and a role-gated admin dashboard for managing the catalog.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

---

## Live Demo

| Service | URL |
|---|---|
| **Storefront** | https://e-commerce-app-kohl-kappa.vercel.app |
| **API** | https://e-commerce-app-z8sd.onrender.com/api/health |
| Product catalog (raw JSON) | https://e-commerce-app-z8sd.onrender.com/api/products |

> **First request is slow.** The API runs on Render's free tier, which spins the instance down after inactivity — the first call after an idle period takes roughly 50 seconds. Open the health check URL and wait for it to respond, then use the storefront.

The client also runs locally against the deployed API, so you don't need a server or a database to try it: `npm install && npm run dev` inside `client/` is enough.

---

## Demo account

Once the app is running, sign in with:

| Email | Password |
|---|---|
| `testuserecom@example.com` | `testuser` |

This is a regular customer account — browse, add to cart, and run a checkout against Razorpay test mode (card `4111 1111 1111 1111`, any future expiry, any CVV). No real money moves.

This account lives in the deployed database, so it works out of the box when the client points at the Render API (the default). If you're running your own local MongoDB instead, register any email and password — `seed.js` loads the product catalog but no users.

The admin dashboard needs an `isAdmin` user, which isn't shared publicly. See [Running locally](#running-locally) to grant it to your own account.

---

## Screenshots

<!-- Add screenshots here. Suggested: home/product grid, product details, cart, checkout with Razorpay modal, admin dashboard. -->
<!-- ![Storefront](docs/screenshots/home.png) -->

_Coming soon._

---

## Features

**Storefront** — browse the catalog, open a product page, add to cart, adjust quantities, check out. Search runs from the navbar with a debounced dropdown showing the top five matches.

**Two ways to sign in** — email and password, or a phone number with an OTP. The OTP path auto-creates an account on first use, so a new customer can get to checkout without filling in a registration form.

**Cart that survives** — the cart lives in MongoDB, not `localStorage`. Log in on a different device and it's still there.

**Payments** — Razorpay checkout, with every transaction verified server-side by signature before it's treated as paid.

**Admin dashboard** — product create, edit and delete, plus a list of registered users. Gated behind an `isAdmin` flag checked on the server, not just hidden in the UI.

---

## Tech stack

| Layer | Choices |
|---|---|
| Frontend | React 19, React Router 7, Context API, Tailwind CSS 4, Vite 8, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcryptjs |
| Payments | Razorpay (orders + signature verification) |

```
E-Commerce-App/
├── client/                 React SPA
│   └── src/
│       ├── components/     Home, ProductDetails, Cart, Checkout,
│       │                   Login, Register, Navbar, SearchBar, AdminDashboard
│       └── context/        AuthContext, CartContext
└── server/                 Express API
    ├── controllers/        auth, product, cart, payment
    ├── models/             User, Product
    ├── routes/
    ├── config/             CORS allowlist
    ├── middleware/         verifyToken, verifyAdmin
    ├── utils/              mockSms
    ├── data/               seed catalog
    └── seed.js
```

---

## Engineering notes

### Payments are verified on the server, never trusted from the client

The dangerous shortcut in any payment integration is letting the browser report success. Razorpay's callback fires in the client, and a client can be manipulated — so a handler that just marks the order paid is trivially exploitable.

The flow here keeps the decision server-side:

1. Client asks the server to create an order. The server calls Razorpay with the amount converted to paise and returns the order.
2. Razorpay's checkout modal handles the payment and returns an order ID, payment ID, and signature.
3. Client sends all three to `/api/payment/verify-payment`.
4. Server recomputes the expected signature — `HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)` — and compares. Only a match counts as paid.

The secret key never leaves the server, so a forged signature isn't possible without it.

### Cart totals are re-checked before charging

`POST /api/cart/validate-cart` re-reads each item from the database and confirms price and availability before an order is created. Otherwise a modified request body could set its own prices — the classic e-commerce vulnerability.

### The cart lives in the database

`CartContext` writes to MongoDB on every mutation and rehydrates from it on load, rather than keeping state in `localStorage`. Slightly more work, but the cart follows the user across devices and sessions.

```jsx
const addToCart = (product) => {
  setCart((prev) => {
    const next = /* merge or append */;
    syncCartToCloud(next);   // persist without blocking the UI
    return next;             // update React immediately
  });
};
```

The sync is fire-and-forget so the UI stays responsive — the local update never waits on the network.

### Search is debounced and projected

Firing a request per keystroke floods the API and returns results out of order. A 500 ms `setTimeout` inside `useEffect`, cleared on each change, means only the pause after typing triggers a call.

The endpoint does its part too — a case-insensitive regex match, `.limit(5)`, and `.select("name price image category inStock")` so the payload carries only what the dropdown renders instead of full product documents.

### CORS is an allowlist, not a wildcard

`app.use(cors())` with no options sets `Access-Control-Allow-Origin: *`, which lets any site on the internet call the API from a visitor's browser. Endpoints still require a valid JWT, but an open policy means any page a logged-in customer happens to visit can quietly make requests with their credentials attached.

`config/cors.js` restricts it to known origins — localhost for development, the Vercel production domain, and a regex covering that project's preview deployments (each Vercel preview gets its own subdomain, so they can't be listed individually).

Two details that matter:

- **Requests with no `Origin` header are allowed.** Those are curl, Postman, server-to-server calls and Render's own health checks — not browser requests, so the same-origin policy CORS exists to enforce doesn't apply. Blocking them breaks uptime monitoring.
- **Rejections return `false`, not an `Error`.** Passing an Error to the callback propagates into Express and surfaces as a 500, which looks like a server crash in the logs. Returning `false` simply omits the CORS headers, which is what makes the browser block the response — the actual intended behavior.

### Admin checks happen server-side

`verifyToken` decodes the JWT and attaches the user; `verifyAdmin` then confirms `isAdmin` before any write. Hiding the admin route in React would stop nobody — anyone can call the API directly. Product create, update and delete all require both middlewares.

---

## API reference

Base URL: `http://localhost:5000/api`

### Auth — `/api`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create an account |
| POST | `/login` | — | Log in, receive JWT |
| POST | `/auth/request-otp` | — | Send an OTP to a phone number |
| POST | `/auth/verify-otp` | — | Verify OTP, log in or auto-register |
| GET | `/users` | — | List users (admin dashboard) |

### Products — `/api/products`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | — | All products |
| GET | `/search?q=` | — | Debounced search, top 5 matches |
| GET | `/:id` | — | Single product |
| POST | `/` | Admin | Create |
| PUT | `/:id` | Admin | Update |
| DELETE | `/:id` | Admin | Delete |

### Cart — `/api/cart`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | User | Fetch the saved cart |
| POST | `/` | User | Persist the cart |
| POST | `/validate-cart` | User | Re-check prices and stock before checkout |

### Payments — `/api/payment`

| Method | Route | Description |
|---|---|---|
| POST | `/create-order` | Create a Razorpay order (amount in paise) |
| POST | `/verify-payment` | Verify the HMAC-SHA256 signature |

---

## Running locally

Just want to look at it? Use the [live storefront](https://e-commerce-app-kohl-kappa.vercel.app) — nothing to install. The instructions below are for running or modifying the code yourself.

### Frontend only

The API is already deployed, so you can work on the React app without running a server or a database:

```bash
git clone https://github.com/EnnilavanSV/E-Commerce-App.git
cd E-Commerce-App/client
npm install
cp .env.example .env      # already points at the deployed API
npm run dev               # → http://localhost:5173
```

Sign in with the demo account above and you're in.

### Full stack locally

**You'll need:** Node 18+, MongoDB (local or Atlas), and a Razorpay account — [test-mode keys](https://dashboard.razorpay.com/app/keys) are free and need no business verification.

```bash
git clone https://github.com/EnnilavanSV/E-Commerce-App.git
cd E-Commerce-App
```

**Server**

```bash
cd server
npm install
```

`server/.env`:

```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=any_long_random_string
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

Load the sample catalog, then start the API:

```bash
node seed.js      # wipes and reseeds the products collection
node server.js    # → http://localhost:5000
```

**Client**

```bash
cd ../client
npm install
```

`client/.env` — point it at your local server instead of the deployed one:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

```bash
npm run dev       # → http://localhost:5173
```

**Test cards:** in test mode, `4111 1111 1111 1111` with any future expiry and any CVV completes a payment. No real money moves.

**Creating an admin:** `isAdmin` defaults to `false` and no endpoint grants it. Register normally, then set it in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { isAdmin: true } })
```

The admin dashboard is at `/admin`.

---

## Environment variables

**`server/.env`**

| Variable | Description |
|---|---|
| `PORT` | API port |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Signing secret for tokens |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret — server only, never expose |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID (public, safe in the client) |

---

## Known limitations

- **OTPs are mocked and stored in memory.** `utils/mockSms.js` prints the code to the server console instead of sending an SMS, and codes live in a `Map` that clears on restart and has no expiry. Production needs a real SMS provider and Redis with a TTL.
- **No orders collection.** Payments are verified but nothing persists an order record afterward, so there's no order history or invoice.
- **No stock decrement.** `inStock` is a boolean and quantity isn't tracked, so nothing decreases when an item sells.
- **No automated tests.**
- **Free-tier cold starts.** The first request after an idle period takes about 50 seconds.
- **No refresh tokens.** Access tokens last a day; there's no rotation.

## Roadmap

- [ ] Order model, order history, and post-payment confirmation
- [ ] Real quantity tracking with stock decrement on purchase
- [ ] Twilio or MSG91 for OTPs, with Redis-backed expiry
- [ ] Product images, categories and pagination
- [ ] Jest + Supertest coverage on payment verification and cart validation
- [ ] Refresh-token rotation

---

## Author

**Ennilavan SV** — MERN stack developer

[GitHub](https://github.com/EnnilavanSV) · [LinkedIn](https://www.linkedin.com/in/ennilavan-sv-09a151340) · [Portfolio](https://personal-portfolio-kappa-topaz-a13ieb812t.vercel.app/)