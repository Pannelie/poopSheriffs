import { sendResponse } from "../../responses/index.mjs";
import { deleteBooking } from "../../services/bookings.mjs";

export const handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event));
    // Extract bookingId from path parameters
    const bookingId = event.pathParameters?.id;

    // Validate bookingId
    if (!bookingId) {
      return sendResponse(400, { 
        message: "Missing bookingId" 
      });
    }

    // Delete booking
    const deletedBooking = await deleteBooking(bookingId);

    // If no booking found to delete
    if (!deletedBooking) {
      return sendResponse(404, { 
        message: `No booking found with id ${bookingId}` 
      });
    }
    // Delete successful
    return sendResponse(200, { 
      message: "Booking deleted successfully", 
      deletedBooking: deletedBooking
    });
  } catch (error) {
    // Error handling
    console.error("Error in handler:", error);
    return sendResponse(500, { 
      message: "Internal Server Error",
      error: error.message
    });
  }
}