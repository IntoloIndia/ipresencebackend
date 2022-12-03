import Joi from "joi";

const employeeAttendanceSchema = Joi.object().keys({
  company_id: Joi.string().required(),
  user_id: Joi.string().required,
});

export default employeeAttendanceSchema;
