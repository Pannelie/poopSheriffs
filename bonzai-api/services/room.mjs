import { docClient } from "./client.mjs";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export const getRoomPrice = async (roomType) => {
  const command = new GetCommand({
    TableName: "bonzai-table",
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

export const getRoomCapacity = async (roomType) => {
  const command = new GetCommand({
    TableName: "bonzai-table",
    Key: { pk: `ROOM#${roomType}`, sk: "INFO" },
    ProjectionExpression: "guests",
  });

  try {
    const result = await docClient.send(command);
    return result.Item ? Number(result.Item.guests) : 0;
  } catch (error) {
    console.error(`Error fetching capacity for room type ${roomType}:`, error.message);
    return 0;
  }
};
