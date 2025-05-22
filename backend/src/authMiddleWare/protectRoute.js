import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import cookieParser from 'cookie-parser';
const protectRoute = async (req,res,next) => {
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Not authorized, no token"
            })
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({
                success:false,
                message:"Not authorized, token failed"
            })
        }
        const user = await User.findById(decoded.id);
        req.user = user;
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Server error",
            error:error.message
        })
    }
}
const manageraccess = async(req,res,next)=>{
    try {
        const user = req.user;
        if(!user){
            return res.status(401).json({message:"you are not logged in "});
        }
        if(user.role==="manager"){
            return next();
        }
        return res.status(403).json({message:"you have to be atleast manager to access this route "});
    } catch (e) {
       return res.status(500).json({
            success:false,
            message:"Server error",
            error:e.message
        })
    }
}
const adminaccess = async(req,res,next)=>{
    try {
        const user = req.user;
        const role = user.role;
        if(role==="admin"){
            return next();
        }
        return res.status(401).json({success:false,message:"you are not authorised to access this route sorry"});
    } catch (error) {
        
    }
}
export {adminaccess}
export {protectRoute}
export {manageraccess}
