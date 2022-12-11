import { CompanyTiming } from "../../models/index.js";
import { companyTimingSchema } from "../../validators/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import CustomSuccessHandler from "../../services/CustomSuccessHandler.js";
import { ObjectId } from "mongodb";

const CompanyTimingController = {
    
  async index(req, res, next) {
    let documents;
    try {
      documents = await CompanyTiming.find({
        company_id: req.params.company_id,
      }).select("-createdAt -updatedAt -__v");
    } catch (error) {
      return next(error);
    }
    return res.json({ status: 200, data: documents });
  },

  async store(req, res, next) {
    const { error } = companyTimingSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const {
      company_id,
      open_time,
      close_time,
      lunch_start_time,
      lunch_over_time,
    } = req.body;

    try {
      const exist = await CompanyTiming.exists({
        company_id: ObjectId(company_id),
      });

      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("Company times are already exist")
        );
      }
    } catch (error) {
      return next(error);
    }

    const companyTimingsData = new CompanyTiming({
      company_id,
      open_time,
      close_time,
      lunch_start_time,
      lunch_over_time,
    });

    try {
      await companyTimingsData.save();
    } catch (error) {
      return next(error);
    }
    return res.send(
      CustomSuccessHandler.success("Comapany timings save successfully")
    );
  },
};

export default CompanyTimingController;
