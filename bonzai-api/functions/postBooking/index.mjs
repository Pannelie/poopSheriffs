import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponse } from '../../responses/index.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { addBooking } from '../../services/bookings.mjs';
import { validateBooking } from '../../middlewares/validateBooking.mjs';

//Länkat till errorHandler som ännu inte är skapad

export const handler = middy(async (event) => {
	const result = await addBooking(event.body);
	if (result) {
		return sendResponse(201, {
			success: true,
			message: 'Room successfully booked',
			booking: event.body,
		});
	} else {
		return sendResponse(404, {
			success: false,
			message: 'Room could not be booked',
		});
	}
})
	.use(httpJsonBodyParser())
	.use(validateBooking())
	.use(errorHandler());
