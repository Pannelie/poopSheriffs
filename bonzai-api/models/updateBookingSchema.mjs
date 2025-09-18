import Joi from "joi";

export const bookingUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  email: Joi.string().email(),
  guests: Joi.number().min(1),
  rooms: Joi.array().items(
    Joi.object({
      roomType: Joi.string().valid("single", "double", "suite"),
      amount: Joi.number().min(1),
    })
  ),
  checkIn: Joi.date().greater("now"),
  nights: Joi.number().min(1),
  checkOut: Joi.date().iso(),
  totalPrice: Joi.number().min(0)
});