import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const designationSchema = mongoose.Schema({
    company_id: { type: ObjectId, required:true},
    department_id: { type: ObjectId, required:true},
    designation: { type: String, required:true},
}, {timestamps:true});

export default mongoose.model('Designation', designationSchema, 'designations');