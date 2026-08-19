import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";

import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import routeReinitialisationMDP from "./routes/routeReinitialisationMDP.js";
import { mountDocs } from "./docs.js";
import connectDB from "./config/db.js";

import securityHeaders from "./middlewares/securityHeaders.js";
import {
  generalLimiter,
  authLimiter,
  geocodeLimiter,
} from "./middlewares/rateLimiter.js";
//import { sanitizeMongo, preventHpp } from "./middlewares/sanitize.js";
import auth from "./middlewares/middlewareAuth.js";
import checkRole from "./middlewares/middlewareCheckRole.js";
import roleRoutes from "./routes/routesRole.js";
import utilisateurRoutes from "./routes/routeUtilisateur.js";
import authRoutes from "./routes/routesAuth.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import categorieRoutes from "./routes/categorieRoutes.js";
import geocodeRoutes from "./routes/geocodeRoutes.js";

import errorHandler from "./middlewares/errorHandler.js";
dotenv.config();

const app = express();

// Connexion à la base de données
const isProd = process.env.NODE_ENV === "production";
const helmetOptions = isProd
  ? {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          // Pas d'inline/eval en prod
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "blob:", "https:"],
          "connect-src": [
            "'self'",
            process.env.FRONTEND_URL || "http://localhost:5173",
            "https://nominatim.openstreetmap.org",
            "https://*.vercel.app",
          ],
          "font-src": ["'self'", "https:", "data:"],
          "base-uri": ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }
  : {
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    };
app.use(helmet(helmetOptions));
// Middleware
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Sécurité

app.use(securityHeaders);

// CORS — whitelist multi-origines (localhost + prod + previews Vercel)
const rawOrigins =
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173";
const WHITELIST = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Requêtes sans Origin (tests, cURL, serveurs) : autoriser
      if (!origin) return cb(null, true);
      try {
        const { hostname } = new URL(origin);
        // Autoriser toutes les previews Vercel : https://*.vercel.app
        const isVercel =
          hostname === "vercel.app" || hostname.endsWith(".vercel.app");
        if (isVercel || WHITELIST.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error(`Origin non autorisé : ${origin}`), false);
      } catch {
        return cb(new Error(`Origin invalide : ${origin}`), false);
      }
    },
    credentials: true,
  })
);
// Rate limit — un seul global
app.use(generalLimiter);

// Parsing & hygiène
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp({ whitelist: ["page", "limit", "sort"] }));

// Compression
app.use(compression());

// Routes
console.info("Avant routes Auth");
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth", authLimiter, routeReinitialisationMDP);
app.use("/api/geocode", geocodeLimiter, geocodeRoutes);

app.use("/api/utilisateurs", utilisateurRoutes);
console.info(" utilisateurs OK");

console.info("Avant routes role");
app.use("/api/roles", auth, checkRole("admin"), roleRoutes);
console.info(" roles OK");

//app.use("/api/permissions", permissionRoutes);
console.info(" Avant routes event");
app.use("/api/events", eventRoutes);

app.use("/api/reservations", auth, bookingRoutes);
console.info(" reservations OK");

console.info(" Avant routes categorie");
app.use("/api/categories", categorieRoutes);
console.info(" categories OK");

mountDocs(app); // ➜ http://localhost:5000/docs

app.use(errorHandler);
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";
console.info("Chargement terminé sans erreurs jusqu'ici ");
//Démarrage orchestré : on attend la DB avant d'écouter le port
const start = async () => {
  try {
    if (process.env.NODE_ENV !== "test") {
      await connectDB(); // mongoose.connect via ./config/db.js
      app.listen(PORT, HOST, () =>
        console.info(`Serveur prêt sur http://${HOST}:${PORT}`)
      );
    } else {
      console.info("CI: serveur non démarré et DB non appelée (NODE_ENV=test)");
    }
  } catch (err) {
    console.error("Échec au démarrage (DB non disponible) :", err);
    process.exit(1);
  }
};
start();
