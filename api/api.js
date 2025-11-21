import { Router } from "express";

import messageRouter from "./messages/messageRouter.js";
import questionRouter from "./questions/questionRouter.js";

const api = Router();

api.use("/message", messageRouter);
api.use("/questions", questionRouter);

export default api;
