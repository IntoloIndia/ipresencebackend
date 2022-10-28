import { Employee } from "../models/index.js";
import CustomFunction from "../services/CustomFunction.js";

export default {

    async generateRandomUserId(){
        const unique_id = CustomFunction.randomUserId();
        try {
            const unique_id_exist = await Employee.exists({emp_id:unique_id});
            if (unique_id_exist) {
                generateRandomUserId();
            }
        } catch (err) {
            return err
        }
        return unique_id;
    }

    
    
}
