import { sendResponse } from "../../responses/index.mjs";
import { throwError } from "../../utils/throwError.mjs";
import { deleteBooking } from "../../services/bookings.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import middy from "@middy/core";

export const handler = middy(async (event) => {
  console.log("Event:", JSON.stringify(event));
  // Extract bookingId from path parameters
  const bookingId = event.pathParameters?.id;

  // Validate bookingId
  if (!bookingId) {
    throwError("Missing bookingId", 400);
  }

  // Delete booking
  const deletedBooking = await deleteBooking(bookingId);

  // If no booking found to delete
  if (!deletedBooking) {
    throwError(`No booking found with id ${bookingId}`, 404);
  }
  // Delete successful
  return sendResponse(200, {
    message: "Booking deleted successfully",
    deletedBooking,
  });
}).use(errorHandler());
