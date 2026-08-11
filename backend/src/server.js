import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { query } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import rentalRoutes from "./routes/rentals.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",") || "http://localhost:3000" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", async (_req, res, next) => { try { await query("SELECT 1"); res.json({ ok: true, service: "ropalia-api" }); } catch (error) { next(error); } });
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.status ? error.message : "Ocurrió un error inesperado." });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Ropalia API lista en http://localhost:${port}`));
