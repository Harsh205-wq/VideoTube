import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
// mongodb automatically creates _id field for every single document
const userSchema=new Schema(
    {
      username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
      },
      email:{
         type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
      },
      fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
      },
      avatar:{
         type:String, // cloudnery url
        required:true,
       
      },
      coverImage:{
         type:String,
      },
      watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
      ],
      password:{
        type:String,
        requires:[true,"password is requires"]
      },
      refreshToken:{
       type:String
      }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save",async function(next){
  if(!this.modified("password")) return next()

  this.password=bcrypt.hash(this.password,10)
  next()
})
userSchema.methods.isPasswordCorrect=async function (password)
 {
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function (){
  // short lived access token
  return jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
)
}

userSchema.methods.generateRefreshToken=function (){
  // short lived access token
  return jwt.sign({
    _id:this._id
  },
  process.env.REFRESH_TOKEN_SECRET,
  {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
)
}

export const User=mongoose.model("User",userSchema)