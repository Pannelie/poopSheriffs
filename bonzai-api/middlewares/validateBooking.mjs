import { bookingSchema } from "../models/bookingSchema.mjs";
import { throwError } from "../utils/throwError.mjs";

export const validateBooking = () => ({
  before: (handler) => {
    const { error, value } = bookingSchema.validate(handler.event.body);
    console.log("Error i middleware:", error);
    console.log("Error i middleware:", value);
    if (error) {
      return throwError(error.message, 400);
    }
  },
});
