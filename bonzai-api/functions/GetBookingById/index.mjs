import { sendResponse } from '../../responses/index.mjs';
import { getBookingById } from '../../services/getBookingById.mjs';

export const handler = async (event) => {
	try {
		const { id } = event.pathParameters || '';

		if (!id) {
			return sendResponse(400, {
				message:
					'This ID does not exist. Please put on glasses and take a closer look! 8-)',
			});
		}

		// booking is undefined right now, until I get it from the database later
		const booking = await getBookingById(id);

		if (!booking) {
			return sendResponse(404, {
				message: `There is no booking with the id of ${id} here...? :---)`,
			});
		}
		return sendResponse(200, booking);
	} catch (error) {
		return sendResponse(500, {
			message:
				'Something went EXTREMELY wrong here when you get an error 500!! -- no bookings, no nothing.',
		});
	}
};
