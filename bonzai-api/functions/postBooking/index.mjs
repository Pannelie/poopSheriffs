import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { formatBookingResponse, sendResponse } from "../../responses/index.mjs";
import { throwError } from "../../utils/throwError.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import { validateBooking } from "../../middlewares/validateBooking.mjs";
import { addBooking } from "../../services/bookings.mjs";

//Länkat till errorHandler som ännu inte är skapad

export const handler = middy(async (event) => {
  const booking = await addBooking(event.body);
  if (!booking.success) {
    throwError(booking.message || "Room could not be booked", 400);
  }

  return sendResponse(201, {
    success: true,
    message: "Room successfully booked",
    booking: formatBookingResponse(booking),
  });
})
  .use(httpJsonBodyParser())
  .use(validateBooking())
  .use(errorHandler());
