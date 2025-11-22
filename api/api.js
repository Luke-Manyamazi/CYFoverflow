import { Router } from "express";

import authRouter from "./auth/authRouter.js";
import messageRouter from "./messages/messageRouter.js";
import questionRouter from "./questions/questionRouter.js";

const api = Router();

// --- Existing Route ---
api.use("/message", messageRouter);
api.use("/questions", questionRouter);

api.use("/auth", authRouter);

export default api;
