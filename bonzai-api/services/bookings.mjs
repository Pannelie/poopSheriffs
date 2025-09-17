import { docClient } from "./client.mjs";
import { GetCommand, PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getRoomCapacity, getRoomPrice } from "./room.mjs";
import { generateId } from "../utils/uuid.mjs";

const getTotalBookedRooms = async () => {
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
    const totalBooked = result.Items.reduce((sum, item) => sum + Number(item.totalRooms), 0);
    return totalBooked;
  } catch (error) {
    console.error({ message: `${error.message} from getTotalBookedRooms` });
    return 0;
  }
};

export const addBooking = async ({ name, email, rooms, guests, checkIn, checkOut }) => {
  const bookingId = generateId(4);
  //För varje rum i bokningen så adderas antalet under "amount"
  const newBookingRooms = rooms.reduce((sum, room) => sum + room.amount, 0);

  //Kontrollerar hur många rum som är bokade totalt på hotellet
  const totalBooked = await getTotalBookedRooms();
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

export const updateBooking = async (bookingId, updateData) => {
  // Hämta befintlig bokning först (om du vill behålla fält som inte skickas in)
  const getCommand = new GetCommand({
    TableName: "bonzai-table",
    Key: {
      pk: "BOOKING",
      sk: bookingId,
    },
  });

  let existingBooking;
  try {
    const result = await docClient.send(getCommand);
    if (!result.Item) {
      return { success: false, message: "Booking not found" };
    }
    existingBooking = result.Item;
  } catch (error) {
    return { success: false, message: `Error fetching booking: ${error.message}` };
  }

  // Skapa nytt booking-objekt genom att slå ihop befintlig och ny data
  const updatedBooking = {
    ...existingBooking,
    ...updateData,
    pk: "BOOKING",
    sk: bookingId,
    bookingId,
    checkIn: updateData.checkIn ? new Date(updateData.checkIn).toISOString() : existingBooking.checkIn,
    checkOut: updateData.checkOut
      ? new Date(updateData.checkOut).toISOString()
      : existingBooking.checkOut ?? null,
  };

  const putCommand = new PutCommand({
    TableName: "bonzai-table",
    Item: updatedBooking,
  });

  try {
    await docClient.send(putCommand);
    return { success: true, booking: updatedBooking };
  } catch (error) {
    return { success: false, message: `Error updating booking: ${error.message}` };
  }
};


export const deleteBooking = async (bookingId) => {
  try {
    const params = {
      TableName: "bonzai-table",
      Key: {
        pk: "BOOKING",
        sk: bookingId,
      },
      ReturnValues: "ALL_OLD",
    };

    const command = new DeleteCommand(params);
    const result = await docClient.send(command);
    return result.Attributes;
  } catch (error) {
    console.error(`Error deleting booking with id ${bookingId}:`, error.message);
    return { success: false, message: `Error deleting booking: ${error.message}`};
  }
}