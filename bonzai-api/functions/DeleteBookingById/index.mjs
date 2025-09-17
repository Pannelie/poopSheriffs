import { sendResponse } from "../../responses/index.mjs";
import { deleteBooking } from "../../services/bookings.mjs";

export const handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event));
    const bookingId = event.pathParameters?.id;

    if (!bookingId) {
      return sendResponse(400, { 
        message: "Missing bookingId" 
      });
    }

    const deletedBooking = await deleteBooking(bookingId);

    if (!deletedBooking) {
      return sendResponse(404, { 
        message: `No booking found with id ${bookingId}` 
      });
    }
    return sendResponse(200, { 
      message: "Booking deleted successfully", 
      deletedBooking 
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return sendResponse(500, { 
      message: "Internal Server Error",
      error: error.message
    });
  }
}