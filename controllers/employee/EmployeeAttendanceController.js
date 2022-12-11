import { EmployeeAttendance } from "../../models/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import CustomSuccessHandler from "../../services/CustomSuccessHandler.js";
import { ObjectId } from "mongodb";
import CustomFunction from "../../services/CustomFunction.js";

const EmployeeAttendanceController = {
  async index(req, res, next) {
    let documents;
    let condition;

    const current_date = CustomFunction.currentDate();

    try {
      if (req.params.user_id) {
        condition = {
          company_id: ObjectId(req.params.company_id),
          user_id: ObjectId(req.params.user_id),
          // year: parseInt(req.params.year),
          // month: parseInt(req.params.month),
        };
      } else {
        condition = {
          company_id: ObjectId(req.params.company_id),
          // year: parseInt(req.params.year),
          // month: parseInt(req.params.month),
        };
      }

      documents = await EmployeeAttendance.aggregate([
        { $unwind: "$presentdates" },
        {
          $match: {
            $and: [
              condition,
              { year: parseInt(req.params.year) },
              { month: parseInt(req.params.month) },
              { "presentdates.present_date": current_date },
            ],
          },
        },
        // {$match:{'presentdates.present_date':current_date}},

        {
          $lookup: {
            from: "employees",
            localField: "user_id",
            foreignField: "_id",
            as: "employeeData",
          },
        },

        {
          $unwind: "$employeeData",
        },

        {
          $project: {
            _id: 1,
            company_id: 1,
            user_id: 1,
            year: 1,
            month: 1,
            user_name: "$employeeData.employee_name",
            presentdates: { $ifNull: ["$presentdates", []] },
          },
        },
      ]);
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json({ status: 200, data: documents });
  },

  async inTimeAttendance(req, res, next) {
    const { company_id, user_id } = req.body;

    const current_date = CustomFunction.currentDate();
    const current_time = CustomFunction.currentTime();
    const year = CustomFunction.currentYearMonthDay("YYYY");
    const month = CustomFunction.currentYearMonthDay("MM");
    const month_name = CustomFunction.monthName();

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

    try {
      const exist = await EmployeeAttendance.exists({
        _id: attendance_main_id,
        presentdates: { $elemMatch: { present_date: current_date } },
      });
      if (exist) {
        return res.send(
          CustomErrorHandler.alreadyExist("You are already presented")
        );
      }
      await EmployeeAttendance.findByIdAndUpdate(
        { _id: attendance_main_id },
        {
          $push: {
            presentdates: {
              present_date: current_date,
              in_time: current_time,
            },
          },
        },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }

    res.send(
      CustomSuccessHandler.success(
        `Today you are presented at - ${current_time}`
      )
    );
  },

  async OutTimeAttendance(req, res, next) {
    const { company_id, user_id } = req.body;

    const current_date = CustomFunction.currentDate();
    const current_time = CustomFunction.currentTime();

    try {
      const exist = await EmployeeAttendance.exists({
        company_id: ObjectId(company_id),
        user_id: ObjectId(user_id),
        presentdates: { $elemMatch: { present_date: current_date } },
      });

      if (!exist) {
        return res.send(
          CustomErrorHandler.alreadyExist("Employee today in time is not exist")
        );
      }

      if (exist) {
        await EmployeeAttendance.findOneAndUpdate(
          {
            _id: exist._id,
            "presentdates.present_date": current_date,
          },
          {
            $set: {
              "presentdates.$.out_time": current_time,
            },
          }
        );
      }
    } catch (err) {
      return next(err);
    }
    res.send(
      CustomSuccessHandler.success(`Your today out time is - ${current_time}`)
    );
  },
};

export default EmployeeAttendanceController;
