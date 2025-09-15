// BASIC CODE TO TEST INSOMNIA

export const handler = async (event) => {
	return {
		statusCode: 200,
		body: JSON.stringify({ message: 'Does this thing work?' }),
	};
};

// REMEMBER TO DO A "SERVERLESS DEPLOY" AFTER CHANGED CODE -- IF NOT INSOMNIA AND LAMBDA ETC WILL NOT WORK.
// Serverless deploy is like saving a file.
