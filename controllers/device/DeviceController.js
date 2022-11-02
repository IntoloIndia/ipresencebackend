import { Device } from "../../models/index.js";
import { deviceSchema } from "../../validators/index.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import CustomSuccessHandler from "../../services/CustomSuccessHandler.js";
import CustomFunction from "../../services/CustomFunction.js";

const DeviceController = {
    async index(req, res, next){
        let documents;
        try {
            documents = await Device.find({company_id:req.params.company_id}).select('-createdAt -updatedAt -__v');
        } catch (err) {
            return next(err);
        }
        return res.json({ status:200, data:documents });
    },

    async deviceConfig(req, res, next){
        const {error} = deviceSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { company_id, device_name, device_ssid} = req.body;
        try {
            const exist = await Device.exists({ company_id:company_id, device_name:device_name, device_ssid:device_ssid }).collation({ locale:'en', strength:1 });
            if (exist) {
                return next( CustomErrorHandler.alreadyExist('Device is already exist') );
            }
        } catch (err) {
            return next(err);
        }
        const deviceData = new Device({
            company_id,
            device_name,
            device_ssid,
        });
        try {
            const result = await deviceData.save();
        } catch (error) {
            return next(error);
        }
        return res.send( CustomSuccessHandler.success("Device configuration successfully") );
    }

}

export default DeviceController;