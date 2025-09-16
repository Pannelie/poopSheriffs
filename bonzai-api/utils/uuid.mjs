import { v4 as uuid } from "uuid";

export const generateBookingId = () => {
  return uuid().substring(0, 4);
};
