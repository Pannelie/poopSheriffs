import { client } from "../../services/client.mjs";
import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { sendResponse } from "../../responses/index.mjs";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return sendResponse(400, { 
        message: "Missing bookingId in path parameters" 
      });
    }

    const booking = {
      TableName: "bonzai-table",
      Key: {
        pk: { S: `BOOKING`},
        sk: { S: id }
      },
      ReturnValues: "ALL_OLD",
    };

    const result = await client.send(new DeleteItemCommand(booking));
    const deletedBooking = result.Attributes;

    if (!deletedBooking) {
      return sendResponse(404, { 
        message: `No booking found with id ${id}` 
      });
    }

    return sendResponse(200, { 
      message: "Booking deleted successfully", 
      deletedBooking 
    });

  } catch (error) {
    console.error("Error deleting booking:", error);
    return sendResponse(500, { 
      message: "Internal Server Error" 
    });
  }
}
