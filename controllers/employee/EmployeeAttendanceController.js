import { EmployeeAttendance } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import CustomSuccessHandler from "../../services/CustomSuccessHandler";
import { ObjectId } from "mongodb";
import CustomFunction from "../../services/CustomFunction";

const EmployeeAttendanceController = {
  async attendance(req, res, next) {
    console.log("object")
    const { company_id, user_id } = req.body;

    const year = CustomFunction.currentYearMonthDay("YYYY");
    const month = CustomFunction.currentYearMonthDay("MM");
    const month_name = CustomFunction.monthName();
    const currentTime = CustomFunction.currentTime();

    let attendance_main_id;

    const exist = await EmployeeAttendance.exists({
      company_id: ObjectId(company_id),
      user_id: ObjectId(user_id),
      year: year,
      month: month,
    });
    try {
      if (!exist) {
        const employeeAttendance = new EmployeeAttendance({
          company_id,
          user_id,
          year: year,
          month: month,
          month_name: month_name,
        });
        const result = await employeeAttendance.save();
        attendance_main_id = result._id;
      } else {
        attendance_main_id = exist._id;
      }
    } catch (error) {
      return next(error);
    }
    res.send(
      CustomSuccessHandler.success(`today you are presented at ${currentTime}`)
    );
  },
};

export default EmployeeAttendanceController;
