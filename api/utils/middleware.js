import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express, { Router } from "express";
import helmet from "helmet";
import morgan from "morgan";

import logger from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * CORS Middleware Configuration
 * This must be configured to allow your frontend origin (http://localhost:5173).
 * @returns {import("express").RequestHandler}
 */
export const configuredCors = () => {
	const corsOptions = {
		// Set this to your frontend's exact origin
		origin: "http://localhost:5173",
		// Allow credentials (like cookies or authorization headers)
		credentials: true,
		// Allow the necessary methods and headers for the preflight request
		allowedMethods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		allowedHeaders: "Content-Type,Authorization",
	};
	return cors(corsOptions);
};

export const clientRouter = (apiRoot) => {
	const staticDir = resolve(__dirname, "..", "static");
	const router = Router();
	router.use(express.static(staticDir));
	router.use((req, res, next) => {
		if (req.method === "GET" && !req.url.startsWith(apiRoot)) {
			return res.sendFile(join(staticDir, "index.html"));
		}
		next();
	});
	return router;
};

export const configuredHelmet = () => helmet({ contentSecurityPolicy: false });

export const configuredMorgan = () =>
	morgan("dev", {
		skip(req) {
			return "container-healthcheck" in req.headers && isHealthcheck(req);
		},
		stream: { write: (message) => logger.info(message.trim()) },
	});

export const httpsOnly = () => (req, res, next) => {
	if (req.secure || isHealthcheck(req)) {
		return next();
	}
	res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
};

/** @type {() => import("express").ErrorRequestHandler} */
export const logErrors = () => (err, _, res, next) => {
	if (res.headersSent) {
		return next(err);
	}
	logger.error("%O", err);
	res.sendStatus(500);
};

/**
 * Whether the request is a `GET /healthz`
 * @param {import("express").Request} req
 * @returns {boolean}
 */
function isHealthcheck(req) {
	return req.path === "/healthz" && req.method === "GET";
}
