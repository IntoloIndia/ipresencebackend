import { Employee, RefreshToken } from "../../models/index.js";
import { employeeSchema } from "../../validators/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import CustomSuccessHandler from "../../services/CustomSuccessHandler.js";
import CustomFunction from "../../services/CustomFunction.js";
import helpers from "../../helpers/index.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import transporter from "../../config/emailConfig.js";
import { EMAIL_FROM, REFRESH_SECRET } from "../../config/index.js";
import Joi from "joi";
import JwtService from "../../services/JwtService.js";

const EmployeeController = {

    async index(req, res, next){
        let documents;
        try {
            // documents = await Employee.find({company_id:req.params.company_id}).select('-createdAt -updatedAt -__v');
            documents = await Employee.aggregate([
                {
                    $match:{
                        company_id:ObjectId(req.params.company_id)
                    }
                },
                {
                    $lookup:{
                        from: "departments",
                        localField:"department_id",
                        foreignField:"_id",
                        as:"departmentData"
                    }
                },
                {
                    $unwind:"$departmentData"
                },
                {
                    $lookup:{
                        from: "designations",
                        localField:"designation_id",
                        foreignField:"_id",
                        as:"designationData"
                    }
                },
                {
                    $unwind:"$designationData"
                },
                {
                    $group:{
                        _id: "$department_id" ,
                        // "main_id": { "$first": "$_id" },
                        "company_id": { "$first": "$company_id" },
                        "department": {"$first": "$departmentData.department"},
                        "employeeList": { 
                            "$push": { 
                                _id: "$_id",
                                designation_id: "$designation_id",
                                designation: "$designationData.designation",
                                employee_name: "$employee_name",
                                employee_mobile: "$employee_mobile",
                                employee_email: "$employee_email",
                            } 
                        },
                        count: { $sum: 1 } 
                    }
                },
                {
                    $project:{
                        company_id:"$company_id",
                        department_id:"$_id",
                        department:"$department",
                        employee_count:"$count",       
                        employeeList:"$employeeList"
                    }
                }
                
            ]);
        } catch (err) {
            return next(err);
        }
        return res.json({ status:200, data:documents });
    },

    async registerEmployee(req, res, next) {
        const { error } = employeeSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { company_id, department_id, designation_id,  employee_name, employee_mobile, employee_email } = req.body;
        try {
            const exist = await Employee.exists({ company_id:company_id, employee_mobile:employee_mobile, employee_email:employee_email }).collation({ locale:'en', strength:1 });
            if (exist) {
                return next( CustomErrorHandler.alreadyExist('Employee is already exist') );
            }
        } catch (err) {
            return next(err);
        }
        const unique_id = await helpers.generateRandomUserId();
        const password = CustomFunction.stringPassword(6);
        const hashedPassword = await bcrypt.hash(password, 10);

        const employeeData = new Employee({
            company_id,
            department_id,
            designation_id,
            emp_id:unique_id,
            employee_name,
            employee_mobile,
            employee_email,
            password:hashedPassword
        });

        try {
            const result = await employeeData.save();
            if (result) {
                let info = transporter.sendMail({
                    from: EMAIL_FROM, // sender address
                    to: employee_email, // list of receivers
                    subject: "Employee Login Id & Password", // Subject line
                    text: " Login ID - " + unique_id + "\n Password - " +  password , // plain text body
                });
            }
        } catch (error) {
            return next(error);
        }
        return res.send( CustomSuccessHandler.success("Employee created successfully") );
    },

    async loginEmployee(req, res, next){
        const employeeSchema = Joi.object({
            emp_id: Joi.string().required(),
            password: Joi.string().required(),
        });
        const {error} = employeeSchema.validate(req.body);

        if(error){
            return next(error);
        }
        try {
            const exist = await Employee.exists({emp_id: req.body.emp_id});
            if(!exist){
                return next(CustomErrorHandler.notExist(' Invalid employee id & password '));
            }
        } catch (err) {
            return next(err)
        }
        try {
            // const employeeData = await Employee.findOne({emp_id: req.body.emp_id});

            var employeeData;
            await Employee.aggregate([
                {
                    $match: {
                        "emp_id": req.body.emp_id
                    }
                },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'company_id',
                        foreignField: '_id',
                        as: 'companyData'
                    },
                },
                { $unwind: "$companyData" },
                {
                    $project:{
                        _id:1,
                        company_id:1,
                        company_name:'$companyData.company_name',
                        password:1,
                        employee_name:1,
                        employee_mobile:1,
                        employee_email:1,
                    }
                }
            ]).then(function ([res]) {
                employeeData = res;
            });

            if(!employeeData){
                return next(CustomErrorHandler.wrongCredentials())
            }

            const match = await bcrypt.compare(req.body.password,employeeData.password);
            if (!match) {
                return next(CustomErrorHandler.wrongCredentials());
            }

            const access_token = JwtService.sign({ _id: employeeData._id });
            const refresh_token = JwtService.sign({ _id: employeeData._id }, '1y', REFRESH_SECRET);

            await RefreshToken.create({ refresh_token: refresh_token });
        
            return res.json({status:200, access_token, refresh_token, _id: employeeData._id, company_id:employeeData.company_id, company_name:employeeData.company_name, name:employeeData.employee_name, mobile:employeeData.employee_mobile, email:employeeData.employee_email});
        } catch (err) {
            return next(err);
        }
    },
    
    async logoutEmployee(req, res, next){
        // validation
        const refreshSchema = Joi.object({
            user_id: Joi.string(),
            refresh_token: Joi.string().required(),
        });
        const { error } = refreshSchema.validate(req.body);
    
        if (error) {
            return next(error);
        }
        const {user_id, refresh_token} = req.body;
        // const bodyData = {
        //     user_id: user_id,
        // }
        try {
            // const result = await AttendanceController.attendanceOutTime(bodyData);
            // if (result.status === 200) {
            //     await RefreshToken.deleteOne({ token: refresh_token });
            // }
            await RefreshToken.deleteOne({ refresh_token: refresh_token });
        } catch(err) {
            return next(new Error('Something went wrong in the database'));
        }
        return res.send({ status: 200 });
    }
    
}

export default EmployeeController;