const ErrorHandler = require("../utils/errorhandler");
const CatchAsyncErrors = require("./CatchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv=require("dotenv");
exports.isAuthenticatedUser = CatchAsyncErrors(async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please Login to access this resources",401));
    }


   const decodeddata = jwt.verify(token,process.env.JWT_SECRET);


    req.user=await User. findById(decodeddata.id);
    
    next();
});

exports.authorizedRoles = (...roles)=>{
    return (req,res,next)=>{

        if(!roles.includes(req.user.role)){
           
          return next( new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403));

        }

        next();
    };
}