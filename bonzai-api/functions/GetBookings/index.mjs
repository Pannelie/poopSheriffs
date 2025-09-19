import middy from "@middy/core";
import { formatBookingResponse, sendResponse } from "../../responses/index.mjs";
import { getAllBookings } from "../../services/bookings.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import { generateBookingSummaryMessage } from "../../utils/booking.mjs";

export const handler = middy(async (event) => {
  const bookings = await getAllBookings();

  if (!bookings || bookings.length === 0) {
    return sendResponse(200, {
      success: true,
      message: "There are no bookings right now. Don’t look so sad – I’m sure there will be some later…",
    });
  }

  const message = generateBookingSummaryMessage(bookings);
  return sendResponse(200, {
    success: true,
    message,
    bookings: bookings.map(formatBookingResponse),
  });
}).use(errorHandler());
