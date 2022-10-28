import Joi from "joi";

const departmentSchema = Joi.object().keys({
    company_id: Joi.string().required(),
    department: Joi.string().required().error(new Error(`"Department" is required cant be an empty`)), //only single validation msg 
})

export default departmentSchema;