import {asynchandler} from  "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary,deleteFromCloudninary} from "../utils/cloudnary.js";

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



export {
    registerUser
}