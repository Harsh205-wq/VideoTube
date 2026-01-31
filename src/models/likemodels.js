import mongoose,{Schema} from "mongoose";


const likeSchema= new Schema({
    // either of"videos,comment or tweets" will be assigned thers are null
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
    commnet:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    tweeet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
},{
    timestamps:true
}
)


export const Like=mongoose.model("Like",likeSchema)