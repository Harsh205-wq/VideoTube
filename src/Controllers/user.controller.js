import {asynchandler} from  "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary,deleteFromCloudninary} from "../utils/cloudnary.js";
import jwt from "jsonwebtoken"

const registerUser=asynchandler(async(req,res)=>{
    // todo
   try {
     const {fullname,email,username,password}=req.body
 
     // validation
     if(
         [fullname,username,email,password].some((field)=> field?.trim()==='')
     ){
         throw new ApiError(400,'All fields are required')
     }
     const existedUser=await User.findOne({
         $or:[{username},{email}]
     })
     if(existedUser){
         throw new ApiError(409,'User already exists')
     }
 
     const avatarLocalPath= req.files?.avatar[0]?.path
     const coverLocalPath= req.files?.coverImage[0]?.path
 
     if(!avatarLocalPath){
         throw new ApiError(400,"Avatar file is missing")
     }
     let  avatar;
     try {
         avatar=await uploadOnCloudinary(avatarLocalPath)
         console.log("Uploaded avatar",avatar)
     } catch (error) {
         console.log("Error uploading avatar",error)
         throw new ApiError(500,"Failed to upload avatar")
     }
     let  coverImage;
     try {
         coverImage=await uploadOnCloudinary(coverLocalPath)
         console.log("Uploaded coverImage",coverImage)
     } catch (error) {
         console.log("Error uploading coverImage",error)
         throw new ApiError(500,"Failed to upload coverImage")
     }
 
 
     const user= await User.create({
         fullname,
         avatar:avatar.url,
         coverImage:coverImage?.url || "",
         email,
         password,
         username:username.toLowerCase()
     })
     const createdUser=await User.findById(user._id).select(
         "-password -refreshToken"
     )
     if(!createdUser){
         throw new ApiError(500,"Something went wrong")
     }
     return res
      .status(201)
      .json(new ApiResponse(200,createdUser,"User registered Succesfully"))
 
 
 
 
 
   } catch (error) {
      console.log("User creation failed")
      if(avatar){
        await deleteFromCloudninary(avatar.public_id)
      }
      if(coverImage){
        await deleteFromCloudninary(coverImage.public_id)
      }
      throw new ApiError(500,"Something went wrong while registering and images are deleted")
   }



})
const generateAccessAndRefreshToken=async (userId)=>{
   try {
    const user= await User.findById(userId)
    // check for user existence

     if(!user){
        throw new ApiError(400,"user not found")
    }
 
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
 
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
   } catch (error) {
    throw new ApiError(500,"Something went wrong while generating access token and refresh token")
    
   }
}

const loginUser=asynchandler(async (req,res)=>{
    // get data from body
    const {email,username,password}=req.body

    // validation
    if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
    }

    if (!password) {
    throw new ApiError(400, "Password is required");
  }

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User not found")
    }

    // validate password
     const isPasswordCValid=await user.isPasswordCorrect(password)
     if(!isPasswordCValid){
        throw new ApiError(401,"Invalid credentials")
     }
     const {accessToken,refreshToken}=await
      generateAccessAndRefreshToken(user._id)

      const loggedInUser=await User.findById(user._id)
      .select("-password -refreshToken")

      const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite: "strict",
      }
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(new ApiResponse(
        200,
        {user:loggedInUser,accessToken,refreshToken},
        "User logged in successfully"
      ))




})
const refreshAccessToken= asynchandler(async(req,res)=>{
    const incommingRefreshToken=req.cookie.refreshToken || req.body.refreshToken
    try {
        const decodedToken=jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        // validation
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid Refresh token")
        }
        if(incommingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Invalid Refresh token")
        }
        const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite: "strict",
      }
       const{accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshToken(user._id)
       
       return res
          .status(200)
          .cookie("accessToken",accessToken.options)
          .cookie("refreshToken",newRefreshToken,options)
          .json(
            new ApiResponse(
                200,
                {accessToken,
                    refreshToken:newRefreshToken
                },
                "Access token refreshed successfully"
            )
          );


    } catch (error) {
        throw new ApiError(500,"Something went wrong while refreshing access token")

    }
})

const logoutUser=asynchandler(async(req,res)=>{
    await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV ==='production',
    }
    return res
     .status(200)
     .clearCokie("accessToken",options)
     .clearCokie("refreshToken",options)
     .json(new ApiResponse(200,{},"User loggedout successfully"))


}) 

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
}

/*   loggin flow
Client
  ↓
loginUser API
  ↓
Validation
  ↓
Find User (DB)
  ↓
Check Password
  ↓
Generate Tokens
  ↓
Set Cookies
  ↓
Send Response

*/