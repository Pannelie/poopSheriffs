import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { formatBookingResponse, sendResponse } from "../../responses/index.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import { addBooking } from "../../services/bookings.mjs";
import { validateBooking } from "../../middlewares/validateBooking.mjs";

//Länkat till errorHandler som ännu inte är skapad

export const handler = middy(async (event) => {
  const booking = await addBooking(event.body);
  if (booking.success) {
    return sendResponse(201, {
      success: true,
      message: "Room successfully booked",
      booking: formatBookingResponse(booking),
    });
  } else {
    return sendResponse(400, {
      success: false,
      message: booking.message || "Room could not be booked",
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateBooking())
  .use(errorHandler());
