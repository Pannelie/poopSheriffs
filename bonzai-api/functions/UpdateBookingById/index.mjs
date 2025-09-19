import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse, formatBookingResponse } from "../../responses/index.mjs";
import { updateBooking } from "../../services/bookings.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import { bookingUpdateSchema } from "../../models/updateBookingSchema.mjs";

export const handler = middy(async (event) => {
  const { error, value } = bookingUpdateSchema.validate(event.body);
  if (error) {
    return sendResponse(400, { message: error.details[0].message });
  }

  const bookingId = event.pathParameters.id;
  const result = await updateBooking(bookingId, event.body);

  if (!result.success) {
    return sendResponse(500, { message: "Internal server error" });
  }

  return sendResponse(200, { message: "Booking updated successfully!", booking: formatBookingResponse(result.booking) });
})
  .use(httpJsonBodyParser())
  .use(errorHandler());
