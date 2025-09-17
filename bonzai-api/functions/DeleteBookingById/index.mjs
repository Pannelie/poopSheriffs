import { sendResponse } from "../../responses/index.mjs";


export const handler = async () => {
  return { statusCode: 200, body: JSON.stringify({ message: "Not implemented" }) };
};