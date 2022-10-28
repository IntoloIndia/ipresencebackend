import Joi from "joi";

const designationSchema = Joi.object().keys({
    company_id: Joi.string().required(),
    department_id: Joi.string().required().error( new Error(`"Department" is required can't be an empty`)),
    designation: Joi.string().required().error(new Error(`"Department" is required can't be an empty`)), //only single validation msg 
});

export default designationSchema;