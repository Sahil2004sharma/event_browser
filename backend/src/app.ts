import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./lib/env";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import eventsRouter from "./routes/events";
import usersRouter from "./routes/users";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use(healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/users", usersRouter);

export default app;
