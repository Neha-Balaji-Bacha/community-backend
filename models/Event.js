import mongoose from "mongoose";
const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type:String,
        required: true,
        trim: true,
        maxLength: 1000,
    },
    communityId:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "community",//models always start with capital letter
       required:true
    },
    host:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    city:{
        type:String,
        // required:true,
        trim:true
    },
    venue:{
       type: String,
    //    required: true,
       trim:true,
    },
    time:{
      type:Date,
      required:true,
    },
     capacity:{
        type: Number,
    },
    mode: {
        type: String,
        enum: ["online", "offline"],
        required: true,
    },
    meetingLink: {
        type: String,
        trim: true
    },
    rsvpedUsers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
],
})
const Event = mongoose.model("event",eventSchema);
export default Event;