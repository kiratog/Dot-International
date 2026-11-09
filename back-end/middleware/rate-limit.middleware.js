
import { rateLimit } from "express-rate-limit";

export const chatLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: 30,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        error: "Too many messages. Please try again later."
    }

});
