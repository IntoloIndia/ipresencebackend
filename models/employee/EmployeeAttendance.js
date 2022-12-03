import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import CustomFunction from "../../services/CustomFunction";

const date = CustomFunction.currentDate();
const time = CustomFunction.currentTime();

const employeeAttendanceSchema = mongoose.Schema({
  company_id: { type: ObjectId, required: true },
  user_id: { type: ObjectId, required: true },
  year: { type: Number },
  month: { type: Number },
  month_name: { type: String },
  presentdates: [
    {
      present_date: { type: String, default: date },
      in_time: { type: String, default: time },
      out_time: { type: String, default: null },
    },
  ],
});

export default mongoose.model(
  "EmployeeAttendance",
  employeeAttendanceSchema,
  "employeeAttendances"
);
