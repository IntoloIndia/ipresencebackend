import Joi from "joi";

const employeeSchema = Joi.object().keys({
    company_id: Joi.string().required(),
    department_id: Joi.string().required().error(new Error(`"Department" is required cant be an empty`)), //only single validation msg 
    designation_id: Joi.string().required().error(new Error(`"Designation" is required cant be an empty`)), //only single validation msg 
    employee_name: Joi.string().required().error(new Error(`"Employee Name" is required cant be an empty`)), //only single validation msg 
    employee_mobile: Joi.string().required().error(new Error(`"Employee Mobile" is required cant be an empty`)), //only single validation msg 
    employee_email: Joi.string().required().error(new Error(`"Employee Email" is required cant be an empty`)), //only single validation msg 
})

export default employeeSchema;