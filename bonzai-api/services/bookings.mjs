import { docClient } from "./client.mjs";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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
    const totalBooked = result.Items.reduce((sum, item) => sum + Number(item.totalRooms.N), 0);
    return totalBooked;
  } catch (error) {
    console.error({ message: `${error.message} from getTotalBookedRooms` });
    return 0;
  }
};

const getRoomPrice = async (roomType) => {
  const command = new GetCommand({
    TableName: bonzai - TableAlreadyExistsException,
    Key: { pk: `ROOM#${roomType}`, sk: "INFO" },
    ProjectionExpression: "price",
  });

  try {
    const result = await docClient.send(command);
    return result.Item ? Number(result.Item.price) : 0;
  } catch (error) {
    console.error(`Error fetching price for room type ${roomType}:`, error.message);
    return 0;
  }
};

export const addBooking = async ({ name, email, rooms, guests, checkIn, checkOut }) => {
  const bookingId = generateId(4);
  const newBookingRooms = rooms.reduce((sum, room) => sum + room.amount, 0);

  const item = {
    pk: "BOOKING",
    sk: bookingId,
    itemType: "booking",
    bookingId,
    name,
    email,
    guests,
    rooms, // direkt array med objekt: [{roomType, amount}]
    checkIn: new Date(checkIn).toISOString(),
    checkOut: checkOut ? new Date(checkOut).toISOString() : null,
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: "bonzai-table",
    Item: item,
    // Item: {
    //   pk: { S: `BOOKING` },
    //   sk: { S: bookingId },
    //   itemType: { S: "booking" },
    //   bookingId: { S: bookingId },
    //   name: { S: name },
    //   email: { S: email },
    //   guests: { N: guests.toString() },
    //   rooms: {
    //     L: rooms.map((room) => ({
    //       M: {
    //         roomType: { S: room.roomType },
    //         amount: { N: room.amount.toString() },
    //       },
    //     })),
    //   },
    //   //Vill vi ha defaultvärden i Schema just nu?
    //   checkIn: { S: new Date(checkIn).toISOString() },
    //   checkOut: checkOut ? { S: new Date(checkOut).toISOString() } : { NULL: true },
    //   createdAt: { S: new Date().toISOString() },
    // },
  });

  try {
    await docClient.send(command);
    return { bookingId, name, guests, rooms, checkIn, checkOut };
  } catch (error) {
    console.error(`Error from db: `, error.message);
    return false;
  }
};
