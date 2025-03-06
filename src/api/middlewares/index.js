// middlewares/index.js

import { handleBadRequest, handleNotFound, handleServerErrors } from './errorHandlers.js';
import logRequestTime from './logRequestTime.js';
import getTokenInfoFromRequest from './getTokenInfoFromRequest .js';
// Xuất khẩu tất cả middlewares
export {
    handleBadRequest,
    handleNotFound,
    handleServerErrors,
    logRequestTime,
    getTokenInfoFromRequest
};
