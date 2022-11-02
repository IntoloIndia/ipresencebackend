import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const deviceSchema = mongoose.Schema({
    company_id:{type: ObjectId, required:true },
    device_name:{type: String, required:true },
    device_ssid:{type: String, required:true },
}, { timestamps:true });

export default mongoose.model('Device', deviceSchema, 'devices');