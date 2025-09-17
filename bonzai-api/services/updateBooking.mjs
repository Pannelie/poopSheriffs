import { client } from "./client.mjs";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";

export const updateBooking = async ({ bookingId, ...fields }) => {
  if (!bookingId) throw new Error("bookingId is required");

  const fieldsMap = {
    name: "S",
    email: "S",
    guests: "N",
    rooms: "L",
    checkIn: "S",
    checkOut: "S",
  };

  let UpdateExpression = "SET ";
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};
  let prefix = "";

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || !fieldsMap[key]) continue;

    ExpressionAttributeNames[`#${key}`] = key;

    if (key === "rooms") {
      ExpressionAttributeValues[`:${key}`] = {
        L: value.map((room) => ({
          M: {
            roomType: { S: room.roomType },
            amount: { N: room.amount.toString() },
          },
        })),
      };
    } else if (key === "checkOut" && !value) {
      ExpressionAttributeValues[`:${key}`] = { NULL: true };
    } else if (fieldsMap[key] === "N") {
      ExpressionAttributeValues[`:${key}`] = { N: value.toString() };
    } else if (fieldsMap[key] === "S") {
      ExpressionAttributeValues[`:${key}`] = { S: key.includes("check") ? new Date(value).toISOString() : value };
    }

    UpdateExpression += `${prefix}#${key} = :${key}`;
    prefix = ", ";
  }

  if (UpdateExpression === "SET ") {
    throw new Error("No fields to update");
  }

  const command = new UpdateItemCommand({
    TableName: "bonzai-table",
    Key: {
      pk: { S: "BOOKING" },
      sk: { S: bookingId },
    },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await client.send(command);
    return result.Attributes;
  } catch (error) {
    console.error(`Error updating booking: `, error.message);
    return false;
  }
};
