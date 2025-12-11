import { Router } from "express";

import answerRouter from "./answers/answerRouter.js";
import authRouter from "./auth/authRouter.js";
import messageRouter from "./messages/messageRouter.js";
import notificationRouter from "./notifications/notificationRouter.js";
import questionRouter from "./questions/questionRouter.js";

const api = Router();

// --- Existing Route ---
api.use("/message", messageRouter);
api.use("/questions", questionRouter);
api.use("/answers", answerRouter);
api.use("/notifications", notificationRouter);

api.use("/auth", authRouter);

export default api;
