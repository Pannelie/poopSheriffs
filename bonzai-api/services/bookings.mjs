import { docClient } from "./client.mjs";
import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getRoomCapacity, getRoomPrice } from "./room.mjs";
import { generateId } from "../utils/uuid.mjs";

export const getAllBookings = async () => {
  const command = new QueryCommand({
    TableName: "bonzai-table",
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": "BOOKING",
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error({ message: `${error.message} from getAllBookings` });
    throw new Error("Could not fetch bookings");
  }
};

export const addBooking = async ({ name, email, rooms, guests, checkIn, nights }) => {
  const bookingId = generateId(4);
  //För varje rum i bokningen så adderas antalet under "amount"
  const newBookingRooms = rooms.reduce((sum, room) => sum + room.amount, 0);

  // Räkna ut checkOut baserat på checkIn och antal nätter
  let checkOut = null;
  if (checkIn && nights) {
    const checkInDate = new Date(checkIn);
    checkOut = new Date(checkInDate);
    checkOut.setDate(checkInDate.getDate() + Number(nights));
    checkOut = checkOut.toISOString();
  }
  if (nights && isNaN(Number(nights))) {
  return { success: false, message: "Nights must be a number" };
}


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

    totalPrice += (price * amount) * nights ;
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
    rooms,
    totalRooms: newBookingRooms,
    totalPrice,
    checkIn: new Date(checkIn).toISOString(),
    checkOut, // <-- nu beräknad automatiskt
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


//==PUT UPPDATERA BOKNING
export const updateBooking = async (bookingId, updateData) => {
  // Hämta befintlig bokning först
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

  // Hantera checkIn och checkOut-format
  if (updateData.checkIn) {
    updateData.checkIn = new Date(updateData.checkIn).toISOString();
  }

  if (updateData.checkOut) {
    updateData.checkOut = new Date(updateData.checkOut).toISOString();
  }

  // Uppdatera checkOut baserat på antal nätter
  if (updateData.nights && (updateData.checkIn || existingBooking.checkIn)) {
    const checkInDate = new Date(updateData.checkIn || existingBooking.checkIn);
    if (!isNaN(Number(updateData.nights))) {
      let checkOut = new Date(checkInDate);
      checkOut.setDate(checkInDate.getDate() + Number(updateData.nights));
      updateData.checkOut = checkOut.toISOString();
    }
  }
//Beräkna totalPrice
  const rooms = updateData.rooms || existingBooking.rooms;
  const nights = Number(updateData.nights || existingBooking.nights);

  let totalPrice = 0;

  for (const room of rooms) {
    const { roomType, amount } = room;
    const price = await getRoomPrice(roomType);
    
    totalPrice += (price * amount) * nights;
    
  }

  updateData.totalPrice = totalPrice;
  

  // Bygg UpdateExpression dynamiskt
  let updateExpression = "set";
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  Object.keys(updateData).forEach((key, index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    updateExpression += ` ${attrName} = ${attrValue},`;
    ExpressionAttributeNames[attrName] = key;
    ExpressionAttributeValues[attrValue] = updateData[key];
  });

  // Ta bort sista kommat
  updateExpression = updateExpression.slice(0, -1);

  const updateCommand = new UpdateCommand({
    TableName: "bonzai-table",
    Key: {
      pk: "BOOKING",
      sk: bookingId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW", // returnerar uppdaterade objektet
  });

  try {
    const result = await docClient.send(updateCommand);
    return { success: true, booking: result.Attributes };
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