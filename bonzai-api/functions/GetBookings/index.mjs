import { sendResponse } from '../../responses/index.mjs';
import { client } from '../../services/client.mjs';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async (event) => {
	try {
		const command = new ScanCommand({ TableName: 'bonzai-table' });
		const result = await client.send(command);

		if (!result.Items || result.Items.length === 0) {
			return sendResponse(200, {
				message:
					"There are no bookings right now. Don't look so sad - I am sure there will be some later... :-)",
			});
		}

		// convert each DynamoDB item to plain JS object
		const bookings = result.Items.map((item) => unmarshall(item));

		return sendResponse(200, bookings);
	} catch (error) {
		return sendResponse(500, { message: error.message });
	}
};
