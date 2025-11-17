import express from "express";

import apiRouter from "../api/routes/api.js";

import { connectDb } from "./db.js";
import config from "./utils/config.js";
import {
	clientRouter,
	configuredCors,
	configuredHelmet,
	configuredMorgan,
	httpsOnly,
	logErrors,
} from "./utils/middleware.js";

const API_ROOT = "/api";

const app = express();

app.use(express.json());

// Security and Logging Middleware
app.use(configuredHelmet());
app.use(configuredMorgan());

app.use(configuredCors());

if (config.production) {
	app.enable("trust proxy");
	app.use(httpsOnly());
}

app.get("/healthz", async (_, res) => {
	await connectDb();
	res.sendStatus(200);
});

// Main API Routes
app.use(API_ROOT, apiRouter);

// Frontend static files and client-side routing fallback
app.use(clientRouter(API_ROOT));

// Error handling middleware (must be last)
app.use(logErrors());

export default app;
