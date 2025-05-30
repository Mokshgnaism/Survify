import express from 'express';
const router = express.Router();
import {register,login,logout,verifyEmail,sendOtp, resetPassword,createBusiness,verifyBusiness, createAdmin,reject} from '../controllers/authController.js';
// import {} from 
import {adminaccess} from "../authMiddleWare/protectRoute.js";
import {protectRoute} from '../authMiddleWare/protectRoute.js';
import { otpRequestLimiter,loginRequestLimiter } from '../authMiddleWare/rateLimit.js';
router.post('/register',register);
router.post('/verifyEmail',verifyEmail);
router.post('/login',login);
router.post('/logout',logout);
router.post('/sendotp',otpRequestLimiter,sendOtp);
router.post('/changepassword',resetPassword);
router.post('/Business-register',createBusiness);
router.post("/verify-business",protectRoute,adminaccess,verifyBusiness);
router.post('/create-admin',protectRoute,adminaccess,createAdmin);
router.post('/reject-business',protectRoute,adminaccess,reject);

router.get('/me',protectRoute,async (req,res)=>{
    res.status(200).json({
        success:true,
        user:req.user
    })
});
export default router;


//main admin
// "name":"loda",
// "email": "mokshu",
// "password":"mokshu"