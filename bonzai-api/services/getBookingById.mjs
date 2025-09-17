import { client } from "./client.mjs";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";

export const getBookingById = async (bookingId) => {
  const command = new GetItemCommand({
    TableName: "bonzai-table",
    Key: {
      pk: { S: "BOOKING" },
      sk: { S: bookingId },
    },
  });

  try {
    const result = await client.send(command);
    console.log("DynamoDB result:", result);
    if (!result.Item) return null;

    // Returnera hela objektet för felsökning
    return {
      bookingId: result.Item.bookingId?.S,
      name: result.Item.name?.S,
      email: result.Item.email?.S,
      guests: result.Item.guests ? Number(result.Item.guests.N) : undefined,
      rooms: result.Item.rooms
        ? result.Item.rooms.L.map((room) => ({
            roomType: room.M.roomType.S,
            amount: Number(room.M.amount.N),
          }))
        : [],
      checkIn: result.Item.checkIn?.S,
      checkOut: result.Item.checkOut?.NULL ? null : result.Item.checkOut?.S,
      createdAt: result.Item.createdAt?.S,
    };
  } catch (error) {
    console.error("Error fetching booking by id:", error.message);
    return null;
  }
};