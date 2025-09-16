import { client } from "../../dynamoClient/index.mjs";
import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { sendResponse } from "../../responses/index.mjs";

export const handler = async (event) => {
  try {
    const bookingId = event.pathParameters?.id;

    if (!bookingId) {
      return sendResponse(400, { message: 'Missing bookingId in path parameters' });
    }

    const del = new DeleteItemCommand({
      TableName: 'bonzai-table',
      Key: { pk: { S: `BOOKING#${bookingId}` } },
      ReturnValues: 'ALL_OLD',
    });

    const result = await client.send(del);

    if (!result.Attributes) {
      return sendResponse(404, { message: `Booking ${bookingId} not found` });
    }

    return sendResponse(200, {
      message: 'Booking deleted successfully',
      booking: result.Attributes,
    });

  } catch (err) {
    console.error('Delete booking error:', err);
    return sendResponse(500, { message: 'Internal Server Error' });
  }
};
