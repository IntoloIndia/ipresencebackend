import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const departmentSchema = mongoose.Schema({
    company_id: { type: ObjectId, required:true },
    department:{ type: String, required:true }
}, { timestamps: true });

export default mongoose.model('Department',departmentSchema,'departments');