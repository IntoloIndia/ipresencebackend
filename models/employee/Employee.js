import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const employeeSchema = mongoose.Schema({
    company_id:{type: ObjectId, required:true },
    department_id:{type: ObjectId, required:true },
    designation_id:{type: ObjectId, required:true },
    emp_id:{type: String, required:true },
    employee_code:{type: String, required:true },
    employee_name:{type: String, required:true },
    employee_mobile:{type: String, required:true },
    employee_email:{type: String, required:true },
    password:{type: String, default:null },
    active:{type: Boolean, default:true },
}, { timestamps:true });

export default mongoose.model('Employee', employeeSchema, 'employees');