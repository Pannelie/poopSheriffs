import { sendResponse } from '../../responses/index.mjs';
import { client } from '../../services/client.mjs';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb'; // converts dynamo data to js

export const handler = async (event) => {
	try {
		// a command that scans the entire table -- the client sends it -- returns items (in dynamodb format)
		const command = new ScanCommand({ TableName: 'bonzai-table' });
		const result = await client.send(command);

		// if no items are found -- sends you a comforting message :---)
		if (!result.Items || result.Items.length === 0) {
			return sendResponse(200, {
				message: `There are no bookings right now. Don't look so sad - I am sure there will be some later... :-)`,
			});
		}

		// translates/converts every item in the database into a js object,
		// so they are not formatted in dynamodb style anymore, since they return as that at first up there ^
		const bookings = result.Items.map((item) => unmarshall(item));

		// if items are found in the table -- returns as OK and shows all the bookings (AKA all the items that we mapped through on row 21)
		return sendResponse(200, bookings);
	} catch (error) {
		return sendResponse(500, { message: error.message });
	}
};
