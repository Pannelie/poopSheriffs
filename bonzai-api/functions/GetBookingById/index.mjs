import { client } from '../../services/client.mjs';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { sendResponse } from '../../responses/index.mjs';

export const handler = async (event) => {
	console.log('Event:', JSON.stringify(event, null, 2));

	try {
		const { id } = event.pathParameters || {};

		if (!id) {
			return sendResponse(400, {
				message:
					'This ID does not exist. Please put on glasses and take a closer look! 8-)',
			});
		}

		const command = new GetItemCommand({
			TableName: 'bonzai-table',
			Key: {
				pk: { S: 'BOOKING' },
				sk: { S: id },
			},
		});

		const result = await client.send(command);

		if (!result.Item) {
			return sendResponse(404, {
				message: `There is no booking with the id of ${id} here...? :---)`,
			});
		}

		// Konverter DynamoDB Item til vanlig JS objekt
		const booking = unmarshall(result.Item);

		return sendResponse(200, booking);
	} catch (error) {
		return sendResponse(500, {
			message:
				'Something went EXTREMELY wrong here when you get an error 500!! -- no bookings, no nothing.',
		});
	}
};