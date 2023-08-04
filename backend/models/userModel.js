const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CatchAsyncErrors = require("../middleware/CatchAsyncErrors");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxLength:[30,"Name cannot exceed more than 30 charecters"],
        minLength:[4,"Name should be more than 5 charecters"]
    },

    email:{
        type:String,
        required:[true,"Please Enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },

    password:{
        type:String,
        required:[true,"Please Enter your Password" ],
        minLength:[8,"Password should be greater than 8 charecters"],
        select:false,
    },

    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },

    role:{
      type:String,
      default:"user"
    },
    
     resetPasswordToken:String,
     resetPasswordExpire:Date,
});

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    } 

    this.password =await bcrypt.hash(this.password,10);
})

//JWT TOKEN
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

//Compare password method

userSchema.methods.comparePassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password);
}

//Generating Password Reset Token

userSchema.methods.getResetPasswordToken = function(){

    //Generating Token

    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and Adding resetpasswordToken

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //Setting Expire time for ResetPasswordToken

    this.resetPasswordExpire = Date.now() + 15*60*1000;

    return resetToken;


}
module.exports = mongoose.model("User",userSchema);

