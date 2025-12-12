import { Router } from "express";

import answerRouter from "./answers/answerRouter.js";
import authRouter from "./auth/authRouter.js";
import questionRouter from "./questions/questionRouter.js";

const api = Router();

api.use("/questions", questionRouter);
api.use("/answers", answerRouter);

api.use("/auth", authRouter);

export default api;
