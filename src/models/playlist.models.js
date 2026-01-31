import mongoose,{Schema} from "mongoose";


const playListSchema= new Schema({
    name:{
        type:String, // cloudnery url
        required:true,
    },
    discription:{
        type:String, 
        required:true,
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },

   
},{
    timestamps:true
}
)


export const playlist=mongoose.model("playlist",playListSchema)