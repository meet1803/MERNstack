const ErrorHandler = require("../utils/errorhandler");
const CatchAsyncErrors = require("../middleware/CatchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")
//Register a User

exports.registerUser = CatchAsyncErrors(async(req,res,next)=>{
    const{name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is simple id",
            url:"profilepicurl"
        }
    });

     sendToken(user,201,res);
});


exports.loginUser = CatchAsyncErrors(async (req,res,next)=>{

    const{email,password}= req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email & Password",400))
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res);
})


exports.logout = CatchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),

        httpOnly:true,
    })

    res.status(200).json({
        success:true,
        message:"Logged Out",
    })
})

//Forgot Password Method

exports.forgotPassword = CatchAsyncErrors(async (req,res,next)=>{

    const user = await User.findOne({email:req.body.email});
    
    if(!user){
        return next(new ErrorHandler("User not found",404));

    }

    //Get ResetPassword Token

   const resetToken = user.getResetPasswordToken();

   await user.save({ validateBeforeSave: false});

   const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

   const message = `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email,then plaease ignore it`;

   
   res.status(200).json({
    success:true,
    message,
    user
   })
//    try {
    
//     await sendEmail({
//        email:user.email,
//        subject:`Ecommerce Password recovery`,
//        message,
//     })

//     res.status(200).json({
//         success:true,
//         message:`Email sent to ${user.email} successfully.`
//     })
//    } catch (error) {
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save({ validateBeforeSave: false});

//     return next(new ErrorHandler(error.message,500));
//    }
})

exports.resetPassword = CatchAsyncErrors(async (req,res,next)=>{
    const ResetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest("hex");

    const user = await User.findOne({resetPasswordToken:ResetPasswordToken,resetPasswordExpire:{$gt:Date.now()}});
      
    if(!user){
        
        return next(new ErrorHandler("Reset Password token is invalid or has been expired",400));
      
    }


    if(req.body.password != req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match confirm paassword",400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res);
});

//Get User Details
exports.getUserDetails = CatchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    


    res.status(200).json({
        success:true,
        user,
    })
})

//Change Password

exports.updatePassword = CatchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Incorrect old Password",401));
    }


    if(req.body.newPassword != req.body.confirmPassword){
        return next(new ErrorHandler("New Password does not match confirm paassword",400));
    }

    user.password = req.body.newPassword;

    await user.save();
    
   

    // res.status(200).json({
    //     success:true,
    //     message:"Password Updataed Successfully."
    // })
    
    sendToken(user,200,res);
})
//Update User Profile

exports.updateProfile = CatchAsyncErrors(async(req,res,next)=>{
   const newUserData={
    name:req.body.name,
    email:req.body.email,
   } 
    // console.log(req.user.id)
   //Add cloudinary later

   const user = await User.findByIdAndUpdate(req.user.id,{name:req.body.name,
    email:req.body.email,},{
    new:true,
    runValidators:true,
    useFindAndModify:false,
   });


   res.status(200).json({
    success:true,
    
    
   })
});


//Get all users (admin)
exports.getAllUser = CatchAsyncErrors(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    })
})

//Get Single user(admin)
exports.getUser = CatchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
      return next(
        new ErrorHandler(`User does not exist with id: ${req.params.id}`)
      )

    }

    res.status(200).json({
        success:true,
        user,
    })
})

//Delete User(admin)

exports.deleteUser = CatchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(
          new ErrorHandler(`User does not exist with id: ${req.params.id}`)
        )
  
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success:true,
        message:"User deleted successfully"
      })
})