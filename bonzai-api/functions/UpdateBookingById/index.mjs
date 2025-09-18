import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../responses/index.mjs";
import { updateBooking } from "../../services/bookings.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import { bookingUpdateSchema } from "../../models/updateBookingSchema.mjs";

export const handler = middy(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) {
    return sendResponse(400, { message: "Missing booking ID in path parameters" });
  }

  const { error, value } = bookingUpdateSchema.validate(event.body);
  if (error) {
    return sendResponse(400, { message: error.details[0].message });
  }

  const bookingId = event.pathParameters.id;
  const result = await updateBooking(bookingId, event.body);

  if (!result.success) {
    return sendResponse(500, { message: result.message || "Failed to update booking" });
  }

  return sendResponse(200, { message: "Booking updated successfully!", booking: result });
})
  .use(httpJsonBodyParser())
  .use(errorHandler());
