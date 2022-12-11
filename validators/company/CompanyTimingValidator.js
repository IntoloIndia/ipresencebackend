import Joi from "joi";

const companyTimingSchema = Joi.object().keys({
  company_id: Joi.string().required(),
  open_time: Joi.string()
    .required()
    .error(new Error(`Company open time is required can't be an empty`)),
  close_time: Joi.string()
    .required()
    .error(new Error(`Company close time is required can't be an empty`)),
  lunch_start_time: Joi.string()
    .required()
    .error(new Error(`Company lunch start time is required can't be an empty`)),
  lunch_over_time: Joi.string()
    .required()
    .error(new Error(`Company lunch over time is required can't be an empty`)),
});

export default companyTimingSchema;
