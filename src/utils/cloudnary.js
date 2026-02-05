import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()


 cloudinary.config({ 
        cloud_name:process.env.CLOUDNIRY_CLOUD_NAME, 
        api_key:process.env.CLOUDNIRY_API_KEY, 
        api_secret:process.env.CLOUDNIRY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary=async(localFilePath)=>{
        try {
            if(!localFilePath) return null
            const response=await cloudinary.uploader.upload(
                localFilePath,{
                    resource_type:"auto"
                }
            )
            console.log("File uploaded on Cloudinary.File src:"+
                response.url
            )
            // once file is uploaded we would like to delete file from our local server
            fs.unlinkSync(localFilePath)
            return response
            
        } catch (error) {
            fs.unlinkSync(localFilePath)
            return null
        }
    }
const deleteFromCloudninary=async (publicId)=>{
    try {
       const result= await cloudinary.uploader.destroy(publicId)
       console.log("Deleted from cloudinary",publicId)
    } catch (error) {
        console.log("Error deleting from cloudinary",error)
        return null
        
    }
}


export {uploadOnCloudinary,deleteFromCloudninary}
    
