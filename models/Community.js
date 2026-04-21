import mongoose from "mongoose";
const communitySchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "user",
    },
    category:{
       type:String,
       enum:["chess","mern","cooking","tech","jobs","sports","politics"],
       message: "Invalid category",
       required: true
    },
    members: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
],
})
const Community = mongoose.model("community",communitySchema);
export default Community;
