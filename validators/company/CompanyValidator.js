import Joi from "joi";

const companySchema = Joi.object().keys({
    company_name: Joi.string().required().error(new Error(`"Company Name" is required cant be an empty`)), //only single validation msg 
    owner_name: Joi.string().required().error(new Error(`"Owner Name" is required cant be an empty`)), //only single validation msg 
    mobile: Joi.number().required().error(new Error(`"Mobile Number" is required cant be an empty`)), //only single validation msg 
    email: Joi.string().required().error(new Error(`"Email Number" is required cant be an empty`)), //only single validation msg 
});

export default companySchema;