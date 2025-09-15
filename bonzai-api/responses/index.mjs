export const sendResponse = (code, data) => {
  return {
    statusCode: code,
    body: JSON.stringify({
      ...data,
    }),
  };
};
