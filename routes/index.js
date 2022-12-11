import express from "express";
const router = express.Router();

import {
  CompanyController,
  ProductKeyController,
  PaymentController,
  DepartmentController,
  DesignationController,
  EmployeeController,
  DeviceController,
  EmployeeAttendanceController,
  CompanyTimingController,
} from "../controllers/index.js";

//company
// import auth from '../middlewares/auth.js';
// import admin from '../middlewares/admin.js';

// import adminEditor from "../middlewares/adminEditor.js";

// //user
// import user_auth from '../middlewares/user_auth.js';

//admin
// router.get('/companies', AdminDashboardController.index);
// router.get('/pending-verify-payment', AdminDashboardController.pendingVerifyPayment);
// router.put('/payment-verify', AdminDashboardController.paymentVerify);

// router.get('/company', [auth, admin], CompanyController.index);
// router.post('/company', CompanyController.store);
// router.post('/company-logout', CompanyController.companyLogout);

router.post("/register-company", CompanyController.register);
router.post("/verify-product-key", ProductKeyController.verifyProductKey);
router.post("/payment", PaymentController.payment);

router.post("/company-login", CompanyController.companyLogin);
router.post("/company-logout", CompanyController.companyLogout);

router.get("/department/:company_id", DepartmentController.index);
router.post("/department", DepartmentController.store);
router.get("/edit-department/:id", DepartmentController.edit);
router.put("/update-department/:id", DepartmentController.update);
router.delete("/department/:id", DepartmentController.destroy);

router.get("/designation/:company_id", DesignationController.index);
router.post("/designation", DesignationController.store);
router.get(
  "/designation-by-department/:department_id",
  DesignationController.designationByDepartment
);

router.get("/employee/:company_id", EmployeeController.index);
router.post("/register-employee", EmployeeController.registerEmployee);
router.post("/login-employee", EmployeeController.loginEmployee);
router.post("/logout-employee", EmployeeController.logoutEmployee);

router.get("/employee-count/:company_id", EmployeeController.employeeCount);

router.get("/device/:company_id", DeviceController.index);
router.post("/device-config", DeviceController.deviceConfig);

//saurabh
router.post(
  "/employee-in-time-attendance",
  EmployeeAttendanceController.inTimeAttendance
);
router.post(
  "/employee-out-time-attendance",
  EmployeeAttendanceController.OutTimeAttendance
);

router.get(
  "/employee-attendance/:company_id/:year?/:month?/:user_id?",
  EmployeeAttendanceController.index
);

router.post("/company-timing", CompanyTimingController.store);
router.get("/company-timing/:company_id", CompanyTimingController.index);

export default router;
