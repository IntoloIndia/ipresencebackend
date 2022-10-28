
import { Designation } from "../../models/index.js";
import { designationSchema } from "../../validators/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import CustomSuccessHandler from "../../services/CustomSuccessHandler.js";
import { ObjectId } from "mongodb";

const DesignationController = {
    async index(req, res, next){
        let documents;
        try {
            documents = await Designation.aggregate([
                {
                    $match:{
                        company_id:ObjectId(req.params.company_id)
                    }
                },
                {
                    $lookup:{
                        from: "departments",
                        localField:"department_id",
                        foreignField:"_id",
                        as:"departmentData"
                    }
                },
                {$unwind:"$departmentData"},
                {
                    $group:{
                        _id: "$department_id" ,
                        // "main_id": { "$first": "$_id" },
                        "company_id": { "$first": "$company_id" },
                        "department": {"$first": "$departmentData.department"},
                        "designationList": { 
                            "$push": { 
                                _id: "$_id",
                                designation_id: "$designation_id",
                                designation: "$designation",
                            } 
                        },        
                    }
                },
                {
                    $project:{
                        _id:null,
                        company_id:"$company_id",
                        department_id:"$_id",
                        department:"$department",
                        designationList:"$designationList"
                    }
                }
            ]);
        } catch (error) {
            return next(error);
        }
        return res.json({ status:200, data:documents });
    },

    async store(req, res, next){
        const { error } = designationSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { company_id, department_id, designation } = req.body;
        try {
            const exist = await Designation.exists({ company_id:company_id, department_id:department_id, designation:designation }).collation({ locale:'en', strength:1 });
            if (exist) {
                return next( CustomErrorHandler.alreadyExist('Designation is already exist') );
            }
        } catch (err) {
            return next(err);
        }
        const designationData = new Designation({
            company_id,
            department_id,
            designation
        });

        try {
            await designationData.save();
        } catch (error) {
            return next(error);
        }
        return res.send( CustomSuccessHandler.success("Designation created successfully") );
    },

    async designationByDepartment(req, res, next){
        let documents;
        try {
            documents = await Designation.find({department_id:req.params.department_id}).select('-createdAt -updatedAt -__v');
        } catch (err) {
            return next(err);
        }
        return res.json({ status:200, data:documents });
    },

    async edit(req, res, next){
        
    },
    async update(req, res, next){

    }
}

export default DesignationController;