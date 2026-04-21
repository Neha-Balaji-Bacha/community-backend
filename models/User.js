import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        // minLength:10,
        maxLength:100
    },
    email: {
        type: String,
        required:true,
        trim: true,
        unique: true,
        lowercase: true,
        index: true
    },
    hashedPassword:{
        type: String,
        required: true,
        select: true,
        minLength:6,
    },
    profilePicUrl:{
        type: String,
    },
    role:{
        type:String,
        enum: ["host","member"],
        default: "member"
    },
    joinedCommunities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "community"
    },
],
hostedCommunities: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "community"
  }
],
rsvpedEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event"
    }
]
})

//creates a model for a MongoDB collection. 
//MongoDB collection name is user = users
//MongoDB automatically converts it to plural form
const User = mongoose.model("user", userSchema);
export default User;