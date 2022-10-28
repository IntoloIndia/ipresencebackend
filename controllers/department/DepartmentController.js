import { Department } from "../../models/index.js";
import { departmentSchema } from "../../validators/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import CustomSuccessHandler from "../../services/CustomSuccessHandler.js";

const DepartmentController = {

    async index(req, res, next){
        let documents;
        try {
            documents = await Department.find({company_id:req.params.company_id}).select('-createdAt -updatedAt -__v');
        } catch (err) {
            return next(err);
        }
        return res.json({ status:200, data:documents });
    },

    async store(req, res, next) {
        const { error } = departmentSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { company_id, department } = req.body;
        try {
            const exist = await Department.exists({ company_id:company_id, department:department }).collation({ locale:'en', strength:1 });
            if (exist) {
                return next( CustomErrorHandler.alreadyExist('Department is already exist') );
            }
        } catch (err) {
            return next(err);
        }
        const departmentData = new Department({
            company_id,
            department
        });

        try {
            await departmentData.save();
        } catch (error) {
            return next(error);
        }
        return res.send( CustomSuccessHandler.success("Department created successfully") );
    },

    async edit(req, res, next){
        let document;
        try {
            document = await Department.findById(req.params.id).select('-createdAt -updatedAt -__v');
        } catch (err) {
            return next(err);
        }
        return res.json({ status:200, data:document });
    },

    async update(req, res, next){
        const { error } = departmentSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { company_id, department } = req.body;
        let document;
        try {
            const exist = await Department.exists({ _id:{$ne:req.params.id}, company_id:company_id, department:department }).collation({ locale:'en', strength:1 });
            if (exist) {
                return next( CustomErrorHandler.alreadyExist('Department is already exist') );
            }
            document = await Department.findByIdAndUpdate( req.params.id,{company_id, department},{new: true});
        } catch (err) {
            return next(err);
        }
        return res.send(CustomSuccessHandler.success("Department updated successfully"));
    },
    
    async destroy(req, res, next){
        try {
            const document = await Department.findByIdAndDelete(req.params.id);
            if (!document) {
                return next(new Error('Nothing to delete'));
            }
        } catch (err) {
            return next(err);
        }
        return res.send( CustomSuccessHandler.success("Department deleted successfully") );
    }

}

export default DepartmentController;