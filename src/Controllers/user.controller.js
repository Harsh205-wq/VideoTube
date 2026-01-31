import {asynchandler} from  "../utils/asynchandler.js";

const registerUser=asynchandler(async(req,res)=>{
    // todo
    const {fullName,email,username,password}=req.body

    // validation
    if(fullName?.trim()===''){
        
    }


})

export {
    registerUser
}