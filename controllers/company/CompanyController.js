import { Company, ProductKey, RefreshToken, Payment } from "../../models/index.js";
import { companySchema } from "../../validators/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import CustomSuccessHandler from "../../services/CustomSuccessHandler.js";
import CustomFunction from "../../services/CustomFunction.js";
import bcrypt from 'bcrypt';
import transporter from "../../config/emailConfig.js";
import { EMAIL_FROM, REFRESH_SECRET } from "../../config/index.js";
import JwtService from "../../services/JwtService.js";
import Joi from "joi";

const CompanyController = {

    async register(req, res, next){
        const {error} = companySchema.validate(req.body);
        if(error){
            return next(error);
        }

        try {
            const exist = await Company.exists({mobile:req.body.mobile});
            if(exist){
                return next(CustomErrorHandler.alreadyExist('Mobile no is already exist'));                
            }
        } catch (err) {
            return next(err);
        }

        try {
            const exist = await Company.exists({email:req.body.email});
            if(exist){
                return next(CustomErrorHandler.alreadyExist('Email is already exist'));
            }
        } catch (err) {
            return next(err);
        }
        const password = CustomFunction.stringPassword(6);
        
        const {company_name, owner_name, mobile, email} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const company = new Company({
            company_name,
            owner_name,
            mobile,
            email,
            password: hashedPassword,
        });

        try {
            const result = await company.save();
            if (result) {
                const product_key = new ProductKey({
                    company_id:result._id,
                    product_key:password,
                });
                try {
                    const product_key_data = await product_key.save();
                } catch (err) {
                    return next(err);
                }
            }

            let info = transporter.sendMail({
                from: EMAIL_FROM, // sender address
                to: email, // list of receivers
                subject: "Login Password and Product Key", // Subject line
                text: " Password and product key " + password, // plain text body
            });

            return res.json({
                status:200, 
                _id:result._id, 
                company_name:result.company_name, 
                owner_name:result.owner_name, 
                mobile:result.mobile, 
                email:result.email, 
                message:'Company created successfully'
            });
        } catch (err) {
            return next(err);
        }
    },

    async companyLogin(req, res, next){
        const companySchema = Joi.object({
            mobile: Joi.number().required(),
            password: Joi.string().required(),
        });
        const {error} = companySchema.validate(req.body);

        if(error){
            return next(error);
        }

        try {
            const exist = await Company.exists({mobile: req.body.mobile});
            if(!exist){
                return next(CustomErrorHandler.notExist('You are do not exist, please click on "Register" button for register a new company.'));
            }

            const product_key = await ProductKey.exists({company_id: exist._id, product_key_verify:false});
            if(product_key){
                return res.json({ status:301, company_id:exist._id, message:'Product key not verify.' });
            }
            
            const payment_exist = await Payment.exists({company_id: exist._id});
            if(!payment_exist){
                return res.json({ status:302, company_id:exist._id, message:'Payment not exist.' });
            }

            //check admin verify
            const check_payment = await Payment.exists({company_id: exist._id, payment_verify:false});
            if(check_payment){
                return res.json({ status:303, message:'Please wait until your payment is not verified.' });
            }
            
        } catch (err) {
            return next(err);
        }
        
        try {
            const company = await Company.findOne({mobile: req.body.mobile});
            if(!company){
                return next(CustomErrorHandler.wrongCredentials())
            }

            const match = await bcrypt.compare(req.body.password,company.password);
            if (!match) {
                return next(CustomErrorHandler.wrongCredentials());
            }

            const access_token = JwtService.sign({ _id: company._id });
            const refresh_token = JwtService.sign({ _id: company._id }, '1y', REFRESH_SECRET);

            await RefreshToken.create({ refresh_token: refresh_token });
        
            res.json({status:200, access_token, refresh_token, _id: company._id, company_id:company._id, company_name: company.company_name, name: company.name, mobile:company.mobile, email:company.email});
            
        } catch (err) {
            return next(err);
        }
    },

    async companyLogout(req, res, next) {
        // validation
        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required(),
        });
        const { error } = refreshSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        const {refresh_token} = req.body;
        try {
            await RefreshToken.deleteOne({ refresh_token: refresh_token });
        } catch(err) {
            return next(new Error('Something went wrong in the database'));
        }
        return res.send({ status: 200 });
    }
}   

export default CompanyController;   