import {asynchandler} from  "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js";

const registerUser=asynchandler(async(req,res)=>{
    // todo
    const {fullName,email,username,password}=req.body

    // validation
    if(
        [fullName,username,email,password].some((field)=> field?.trim()==='')
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
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverLocalPath)


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








})

export {
    registerUser
}