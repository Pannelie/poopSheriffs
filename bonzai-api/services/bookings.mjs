import { client } from "./client.mjs";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { generateId } from "../utils/uuid.mjs";

export const addBooking = async ({ name, email, rooms, guests, checkIn, checkOut }) => {
  const bookingId = generateId(4);
  const command = new PutItemCommand({
    TableName: "bonzai-table",
    Item: {
      pk: { S: `BOOKING` },
      sk: { S: bookingId },
      itemType: { S: "booking" },
      bookingId: { S: bookingId },
      name: { S: name },
      email: { S: email },
      guests: { N: guests.toString() },
      rooms: {
        L: rooms.map((room) => ({
          M: {
            roomType: { S: room.roomType },
            amount: { N: room.amount.toString() },
          },
        })),
      },
      //Vill vi ha defaultvärden i Schema just nu?
      checkIn: { S: new Date(checkIn).toISOString() },
      checkOut: checkOut ? { S: new Date(checkOut).toISOString() } : { NULL: true },
      createdAt: { S: new Date().toISOString() },
    },
  });

  try {
    await client.send(command);
    return { bookingId, name, guests, rooms, checkIn, checkOut };
  } catch (error) {
    console.error(`Error from db: `, error.message);
    return false;
  }
};
