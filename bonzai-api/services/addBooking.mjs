import { client } from "./client.mjs";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { generateId } from "../utils/uuid.mjs";

export const addBooking = async ({ userEmail, roomsBooked, guestCount }) => {
  const command = new PutItemCommand({
    TableName: "bonzai-table",
    Item: {
      pk: { S: `BOOKING#${generateId(4)}` },
      sk: { S: `USER#${userEmail}` },
      itemType: { S: "booking" },
      userEmail: { S: userEmail },
      guestCount: { N: guestCount.toString() },
      roomsBooked: {
        L: roomsBooked.map((room) => ({ S: room })),
      },
      createdAt: { S: new Date().toISOString() },
    },
  });

  try {
    await client.send(command);
    return true;
  } catch (error) {
    console.error(`Error from db: `, error.message);
    return false;
  }
};
