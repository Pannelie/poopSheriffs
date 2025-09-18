export const calculateCheckout = (checkIn, nights) => {
  if (!checkIn || !nights) return null;
  const checkInDate = new Date(checkIn);
  const checkOut = new Date(checkInDate);
  checkOut.setDate(checkInDate.getDate() + Number(nights));
  return checkOut.toISOString();
};
