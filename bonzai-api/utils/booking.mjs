import { getRoomPrice, getRoomCapacity } from "../services/room.mjs";

export const calculateRoomsTotals = async (rooms, nights) => {
  let totalPrice = 0;
  let totalCapacity = 0;

  for (const room of rooms) {
    const amount = Number(room.amount ?? 0);
    const price = (await getRoomPrice(room.roomType)) ?? 0;
    const maxGuestsPerRoom = (await getRoomCapacity(room.roomType)) ?? 0;

    totalPrice += price * amount * nights;
    totalCapacity += maxGuestsPerRoom * amount;
  }
  return { totalPrice, totalCapacity };
};

export const checkAvailableRooms = (rooms, allBookings, bookingIdToExclude) => {
  const totalBooked = allBookings.filter((b) => b.bookingId !== bookingIdToExclude).reduce((sum, item) => sum + Number(item.totalRooms), 0);

  const newBookingRooms = rooms.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const maxRooms = 20;
  const availableRooms = maxRooms - totalBooked;

  if (newBookingRooms > availableRooms) {
    return { success: false, message: `Only ${availableRooms} room(s) available`, availableRooms };
  }
  return { success: true, totalRooms: newBookingRooms };
};
