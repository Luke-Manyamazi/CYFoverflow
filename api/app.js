import express from "express";

import apiRouter from "./api.js";
import { testConnection } from "./db.js";
import config from "./utils/config.js";
import {
	clientRouter,
	configuredHelmet,
	configuredMorgan,
	httpsOnly,
	logErrors,
} from "./utils/middleware.js";

const API_ROOT = "/api";

const app = express();

app.use(express.json());
app.use(configuredHelmet());
app.use(configuredMorgan());

if (config.production) {
	app.enable("trust proxy");
	app.use(httpsOnly());
}

app.get("/healthz", async (_, res) => {
	await testConnection();
	res.sendStatus(200);
});

// Diagnostic endpoint to check if users table exists
app.get("/api/debug/tables", async (_, res) => {
	try {
		const db = (await import("./db.js")).default;
		const result = await db.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'",
		);
		const tables = await db.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
		);
		res.json({
			usersTableExists: result.rows.length > 0,
			allTables: tables.rows.map((r) => r.table_name),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.use(API_ROOT, apiRouter);

app.use(clientRouter(API_ROOT));

app.use(logErrors());

export default app;
