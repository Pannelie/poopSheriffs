import { bookingSchema } from "../models/bookingSchema.mjs";

export const validateBooking = () => ({
  before: (handler) => {
    const { error, value } = bookingSchema.validate(handler.event.body);
    console.log("Error i middleware:", error);
    console.log("Error i middleware:", value);
    if (error) {
      throw new Error(error.details[0].message);
    }
  },
});
