
import { processMessage } from "../services/agent.service.js";

export async function chatController(req, res, next) {

    try {

        const { message, sessionId } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }

        if (message.trim().length === 0 || message.length > 2000) {
            return res.status(400).json({
                success: false,
                error: "Message must contain 1-2000 characters."
            });
        }

        const result = await processMessage(
            message.trim(),
            sessionId
        );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        next(error);
    }
}
