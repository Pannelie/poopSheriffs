import Joi from 'joi';

  bookingId: Joi.string().required(),
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  guests: Joi.number().min(1).required(),
  rooms: Joi.array()
    .items(
      Joi.object({
        roomType: Joi.string().valid('single', 'double', 'suite').required(),
        amount: Joi.number().min(1).required(),
      })
    )
  .min(1)
  .required(),
  checkIn: Joi.date().greater('now').required(),
  checkOut: Joi.date().iso().optional(),
  totalPrice: Joi.forbidden()
})