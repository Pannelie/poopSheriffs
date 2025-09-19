import { formatDateForResponse } from "../utils/date.mjs";

export const sendResponse = (code, data) => {
  return {
    statusCode: code,
    body: JSON.stringify({
      ...data,
    }),
  };
};

// Skapar ett “rent” booking-objekt för API-respons
export const formatBookingResponse = (item) => ({
  bookingId: item.bookingId,
  name: item.name,
  email: item.email,
  guests: item.guests,
  rooms: item.rooms,
  totalRooms: item.totalRooms,
  totalPrice: item.totalPrice,
  checkIn: formatDateForResponse(item.checkIn),
  checkOut: formatDateForResponse(item.checkOut),
  nights: item.nights,
});
