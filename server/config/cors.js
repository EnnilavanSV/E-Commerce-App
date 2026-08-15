// config/cors.js
//
// Single source of truth for which origins may call this API.
//
// Previously server.js ran `app.use(cors())` with no options, which sets
// Access-Control-Allow-Origin: * and lets any site on the internet call every
// endpoint from a visitor's browser. Requests still need a valid JWT, but an
// open policy means any page a logged-in user visits can quietly hit this API
// with their credentials attached.

const staticOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:5174",

  // Production frontend (Vercel)
  "https://e-commerce-app-kohl-kappa.vercel.app",
];

// Vercel gives every preview deployment its own subdomain
// (e-commerce-app-git-<branch>-<scope>.vercel.app), so branch previews can't be
// listed one by one. This matches that project's previews and nothing else.
const previewPattern = /^https:\/\/e-commerce-app-[a-z0-9-]+\.vercel\.app$/;

// Optional escape hatch: set CLIENT_URL in the environment to allow one more
// origin without editing this file (useful when the domain changes).
const allowedOrigins = process.env.CLIENT_URL
  ? [...staticOrigins, process.env.CLIENT_URL]
  : staticOrigins;

const isAllowed = (origin) =>
  allowedOrigins.includes(origin) || previewPattern.test(origin);

const corsOptions = {
  origin(origin, callback) {
    // No Origin header at all: curl, Postman, server-to-server calls and
    // Render's health checks. These aren't browser requests, so the
    // same-origin policy CORS protects doesn't apply. Rejecting them would
    // break the platform's own uptime checks.
    if (!origin) return callback(null, true);

    if (isAllowed(origin)) return callback(null, true);

    // Deny by returning false rather than an Error. An Error here would
    // propagate to Express and surface as a confusing 500; returning false
    // just omits the CORS headers, which is what makes the browser block it.
    console.warn(`Blocked by CORS: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export { allowedOrigins, corsOptions };
