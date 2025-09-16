import { sendResponse } from "../responses/index.mjs";

export const errorHandler = () => ({
    onError : (handler) => {
        handler.response = sendResponse(404, { message : handler.error.message });
    }
});
