import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../responses/index.mjs";
import { updateBooking } from "../../services/bookings.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import { bookingUpdateSchema } from "../../models/updateBookingSchema.mjs";
import { throwError } from "../../utils/throwError.mjs";

export const handler = middy(async (event) => {
  const bookingId = event.pathParameters?.id;

  if (!bookingId) {
    throwError("Missing booking ID in path parameters", 400);
  }

  const { error, value } = bookingUpdateSchema.validate(event.body);
  if (error) {
    throwError(error.details[0].message, 400);
  }

  const result = await updateBooking(bookingId, value);

  if (!result.success) {
    throwError(result.message || "Failed to update booking", 500);
  }

  return sendResponse(200, { message: "Booking updated successfully!", booking: result });
})
  .use(httpJsonBodyParser())
  .use(errorHandler());
