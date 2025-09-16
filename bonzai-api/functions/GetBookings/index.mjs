import { sendResponse } from '../../responses/index.mjs';

export const handler = async (event) => {
	try {
		if (event.body) {
			return sendResponse(200, event.body);
			// returns everything inside the body of the object if it exists
		}

		// sendResponse checks the body, if it is empty then it returns a comforting message instead :-)
		return sendResponse(200, {
			message:
				"There are no bookings right now. Don't look so sad - I am sure there will be some later... :-)",
		});
	} catch (error) {
		return sendResponse(500, { message: error.message });
	}
};

// TEST COMMENT HERE BLABLA
