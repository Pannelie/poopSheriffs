import Joi from 'joi';

export const bookingSchema = Joi.object({
  bookingId: Joi.string().guid({ version: 'uuidv4' }).required(),
  roomType: Joi.string().valid('single', 'double', 'suite').required(),
  guestName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(/^\+?[0-9\s-]{7,20}$/).required(),
  roomNumber: Joi.number().integer().min(1).required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required(),
  numberOfGuests: Joi.number().integer().min(1).max(10).required(),  
  createdAt: Joi.date().iso().default(() => new Date(), 'current date'),
  updatedAt: Joi.date().iso().default(() => new Date(), 'current date'),
});
