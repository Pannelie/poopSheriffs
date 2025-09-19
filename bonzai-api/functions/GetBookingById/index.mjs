import { getBookingById } from "../../services/bookings.mjs";
import { sendResponse } from "../../responses/index.mjs";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return sendResponse(400, { message: "Missing bookingId" });
    }

    const booking = await getBookingById(id);

    if (!booking) {
      return sendResponse(404, {
        message: `No booking found with id ${id}`,
      });
    }

    const formattedBooking = formatBookingResponse(booking);

    return sendResponse(200, formattedBooking);
  } catch (error) {
    console.error("Error in handler:", error);
    return sendResponse(500, {
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
