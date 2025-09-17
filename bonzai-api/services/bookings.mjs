import { docClient } from "./client.mjs";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getRoomCapacity, getRoomPrice } from "./room.mjs";
import { generateId } from "../utils/uuid.mjs";

export const getAllBookings = async () => {
  const command = new QueryCommand({
    TableName: "bonzai-table",
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": "BOOKING",
    },
    ProjectionExpression: "totalRooms",
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error({ message: `${error.message} from getAllBookings` });
    throw new Error("Could not fetch bookings");
  }
};

export const addBooking = async ({ name, email, rooms, guests, checkIn, checkOut }) => {
  const bookingId = generateId(4);
  //För varje rum i bokningen så adderas antalet under "amount"
  const newBookingRooms = rooms.reduce((sum, room) => sum + room.amount, 0);

  //Kontrollerar hur många rum som är bokade totalt på hotellet
  const allBookings = await getAllBookings();
  const totalBooked = allBookings.reduce((sum, item) => sum + Number(item.totalRooms), 0);
  const maxRooms = 20;
  const availableRooms = maxRooms - totalBooked;

  if (availableRooms <= 0) {
    console.error("Cannot book rooms: hotel would exceed max capacity of 20 rooms.");
    return { success: false, message: "No rooms available: hotel is fully booked" };
  }

  if (newBookingRooms > availableRooms) {
    console.error("Cannot book rooms: hotel would exceed max capacity of 20 rooms.");
    return {
      success: false,
      message: `Only ${availableRooms} room(s) available`,
      availableRooms,
    };
  }

  let totalPrice = 0;
  let totalCapacity = 0;

  for (const room of rooms) {
    const { roomType, amount } = room;

    const price = await getRoomPrice(room.roomType);
    const maxGuestsPerRoom = await getRoomCapacity(roomType);

    totalPrice += price * amount;
    totalCapacity += maxGuestsPerRoom * amount;

    // Kontrollera att gäster inte bryter mot max per rumstyp
    if (guests / newBookingRooms > maxGuestsPerRoom) {
      const roomText = newBookingRooms > 1 ? "rooms" : "room";
      return {
        success: false,
        message: `Too many guests for your ${roomText}. Please choose another alternative`,
      };
    }
  }
  if (guests > totalCapacity) {
    return { success: false, message: "Too many guests for selected rooms" };
  }

  const item = {
    pk: "BOOKING",
    sk: bookingId,
    itemType: "booking",
    bookingId,
    name,
    email,
    guests,
    rooms, // direkt array med objekt: [{roomType, amount}]
    totalRooms: newBookingRooms,
    totalPrice,
    checkIn: new Date(checkIn).toISOString(),
    checkOut: checkOut ? new Date(checkOut).toISOString() : null,
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: "bonzai-table",
    Item: item,
  });

  try {
    await docClient.send(command);
    return { success: true, bookingId, name, guests, rooms, totalRooms: newBookingRooms, totalPrice, checkIn, checkOut };
  } catch (error) {
    console.error(`Error from db: `, error.message);
    return { success: false, message: `Error saving booking: ${error.message}` };
  }
};
