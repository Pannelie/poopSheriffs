import { sendResponse } from '../../responses/index.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';

export const handler = errorHandler(async (event) => {
	if (event.body) {
		return sendResponse(200, event.body);
		// returns everything inside the body of the object if it exists
	}

	// sendResponse checks the body, if it is empty then it returns a comforting message instead :-)
	return sendResponse(200, {
		message:
			"There are no bookings right now. Don't look so sad - I am sure there will be some later... :-)",
	});
});
