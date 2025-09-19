import { docClient } from "./client.mjs";
import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
// import { getRoomCapacity, getRoomPrice } from "./room.mjs";
import { generateId } from "../utils/uuid.mjs";
import { validateBookingCapacity } from "../utils/booking.mjs";
import { calculateCheckout, formatDateForResponse } from "../utils/date.mjs";

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
    // converts weird date into normal date for bookings
    const bookings = (result.Items || []).map((b) => ({
      ...b,
      checkIn: formatDateForResponse(b.checkIn),
      checkOut: formatDateForResponse(b.checkOut),
      createdAt: formatDateForResponse(b.createdAt),
    }));
    return bookings;
  } catch (error) {
    console.error({ message: `${error.message} from getAllBookings` });
    throw new Error("Could not fetch bookings");
  }
};

export const addBooking = async ({ name, email, rooms, guests, checkIn, nights }) => {
  if (nights && isNaN(Number(nights))) {
    return { success: false, message: "Nights must be a number" };
  }

  const { totalPrice, totalCapacity, totalRooms } = await validateBookingCapacity({ rooms, guests, nights });
  const bookingId = generateId(4);
  const checkOut = calculateCheckout(checkIn, nights);

  const item = {
    pk: "BOOKING",
    sk: bookingId,
    itemType: "booking",
    bookingId,
    name,
    email,
    guests,
    rooms,
    nights,
    totalRooms,
    totalPrice,
    checkIn: new Date(checkIn).toISOString(), // <-- normal dates format
    checkOut: new Date(checkOut).toISOString(), // <-- calculates automatically
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: "bonzai-table",
    Item: item,
  });

  try {
    await docClient.send(command);
    return { success: true, ...item };
  } catch (error) {
    console.error(`Error from db: `, error.message);
    return {
      success: false,
      message: `Error saving booking: ${error.message}`,
    };
  }
};

// GET BOOKING BY ID
import { client } from "./client.mjs";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export const getBookingById = async (id) => {
  const command = new GetItemCommand({
    TableName: "bonzai-table",
    Key: {
      pk: { S: "BOOKING" },
      sk: { S: id },
    },
  });

  const result = await client.send(command);
  if (!result.Item) return null;

  return unmarshall(result.Item);
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
    return {
      success: false,
      message: `Error fetching booking: ${error.message}`,
    };
  }

  const rooms = updateData.rooms || existingBooking.rooms;
  const nights = Number(updateData.nights ?? existingBooking.nights);
  const guests = Number(updateData.guests ?? existingBooking.guests);

  const { totalPrice, totalRooms } = await validateBookingCapacity({ rooms, guests, nights, bookingId });
  const checkIn = updateData.checkIn ?? existingBooking.checkIn;
  const checkOut = calculateCheckout(checkIn, nights);

  const updatePayload = {
    ...updateData,
    totalRooms,
    totalPrice,
    checkOut,
    checkIn: new Date(checkIn).toISOString(),
  };

  // Bygg UpdateExpression dynamiskt
  let updateExpression = "set";
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  Object.keys(updatePayload).forEach((key, index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    updateExpression += ` ${attrName} = ${attrValue},`;
    ExpressionAttributeNames[attrName] = key;
    ExpressionAttributeValues[attrValue] = updatePayload[key];
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
    return {
      success: false,
      message: `Error updating booking: ${error.message}`,
    };
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
    return {
      success: false,
      message: `Error deleting booking: ${error.message}`,
    };
  }
};
