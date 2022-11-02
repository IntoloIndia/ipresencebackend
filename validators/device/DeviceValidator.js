import Joi from "joi";

const deviceSchema = Joi.object().keys({
    company_id: Joi.string().required(),
    device_name: Joi.string().required().error(new Error(`"Device Name" is required cant be an empty`)), //only single validation msg 
    device_ssid: Joi.string().required().error(new Error(`"Device SSID" is required cant be an empty`)), //only single validation msg 
})

export default deviceSchema;