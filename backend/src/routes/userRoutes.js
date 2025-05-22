import User from "../models/user.js";
import express from "express";
import { protectRoute } from "../authMiddleWare/protectRoute.js";
import {getsurveys,addsurvey,deleteSurvey,getsurvey,getBusinessSurveys,getsurveyResult} from "../controllers/userController.js";
const router = express.Router();
import { submitSurveyResult } from "../controllers/userController.js";
import {getUnverifiedBusiness} from '../controllers/userController.js';
import { adminaccess } from "../authMiddleWare/protectRoute.js";
// import { protectRoute } from "../authMiddleWare/protectRoute.js";
import { manageraccess } from "../authMiddleWare/protectRoute.js";
router.use(protectRoute);
router.post("/getsurveys",getsurveys);//with a string in  only. 
router.post("/addsurvey",addsurvey);
router.post("/deletesurvey",manageraccess,deleteSurvey);
router.post("/getsurvey",getsurvey);//single survey for the user 
router.post("/getmysurveys",manageraccess,getBusinessSurveys);//only get the business surveys . 
router.post("/getsurveyresult",getsurveyResult);//get the survey result for the user
router.post("/:id/submit", submitSurveyResult);
router.post("/get-unverified-business",adminaccess,getUnverifiedBusiness);
export default router;