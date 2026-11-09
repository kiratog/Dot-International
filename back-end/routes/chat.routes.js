
import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { chatLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/", chatLimiter, chatController);

export default router;
