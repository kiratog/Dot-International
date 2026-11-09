
export function errorHandler(error, req, res, next) {

    console.error("Backend error:", error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        error: "Something went wrong. Please try again later."
    });
}
