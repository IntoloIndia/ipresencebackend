import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const CompanyTimingSchema = mongoose.Schema({
  company_id: { type: ObjectId, required: true },
  open_time: { type: String, required: true },
  close_time: { type: String, required: true },
  lunch_start_time: { type: String, required: true },
  lunch_over_time: { type: String, required: true },
});

export default mongoose.model(
  "CompanyTiming",
  CompanyTimingSchema,
  "companyTimings"
);
