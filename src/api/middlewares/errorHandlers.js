import createError from "http-errors";

// Middleware bắt lỗi 400 (Bad Request)
export const handleBadRequest = (req, res, next) => {
    const badRequestCondition = false; // Thay đổi theo điều kiện của bạn
    if (badRequestCondition) {
        next(createError(400, "Bad Request"));
    } else {
        next();
    }
};

// Middleware bắt lỗi 404 (Not Found)
export const handleNotFound = (req, res, next) => {
    next(createError(404, "Not Found yadiyadi yada"));
};

// Middleware xử lý các lỗi khác (500, Internal Server Error)
export const handleServerErrors = (err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
};
