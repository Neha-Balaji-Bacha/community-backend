// //Service contains logic and database operations and validates data returns result to controller
import  User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Community from "../models/Community.js";
import mongoose from "mongoose";
import Event from "../models/Event.js";

//Register
const  registerUser = async ({name,email,password}) => {
    const inputErrors = [];
    if(!name) inputErrors.push("name is Required");
    if(!email) inputErrors.push("email is Required");
    if(!password) inputErrors.push("password is Required");
    
    if(password?.length < 6)
        inputErrors.push("password length must be atleast 6 characters");
    
    if(name.length < 10 || name.length > 100)
        inputErrors.push("Name length must be in range [10,100]");
    
    const existingUser = await User.findOne({email:email});
    console.log(existingUser);

    //Prevent duplicate user
    if(existingUser) inputErrors.push(`Email: ${email} already exists`);

    if(inputErrors.length)
        throw new Error(inputErrors.join(", "));

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({name,email, hashedPassword: hashedPassword}); //take schema from models and validates
    await user.save();//saved in DB

  const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
    return token;
};


//Login
const loginUser = async ({ email, password }) => {
  const inputErrors = [];

  if (!email) inputErrors.push("Email is required");
  if (!password) inputErrors.push("Password is required");

  if (password?.length < 6)
    inputErrors.push("password length must be atleast 6 characters");

  if (inputErrors.length) throw new Error(inputErrors.join(", "));

  // IMPORTANT: include profilePicUrl + name
  const existingUser = await User.findOne({ email })
    .select("+hashedPassword name email role profilePicUrl");

  if (!existingUser) {
    throw new Error(`user with this email (${email}) doesn't exists`);
  }

  const validPassword = await bcrypt.compare(
    password,
    existingUser.hashedPassword
  );

  if (!validPassword) {
    throw new Error("invalid password");
  }

 const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
  expiresIn: "1d",
});

  const hostedCommunities = await Community.find({
    host: existingUser._id,
  }).select("_id name");

  const joinedCommunities = await Community.find({
    members: existingUser._id,
  }).select("_id name");

  return {
    token,
    user: existingUser,
    hostedCommunities,
    joinedCommunities,
  };
};

//forgot

const forgotPassword = async (email) => {
  const user = await User.findOne({ email }); // ✅ CORRECT

  if (!user) return null;

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  console.log("RESET LINK:", resetUrl);

  return resetUrl;
};

//reset
const resetPassword = async (token, password) => {
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Token expired or invalid");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new Error("User not found");
  }

  // hash new password
user.hashedPassword = await bcrypt.hash(password, 10);

  // optional but recommended
  user.passwordChangedAt = Date.now();

  await user.save();
};


//join community
const joinCommunity = async ({userId, communityId}) =>{
  if(!communityId)
    throw new Error("community id is required");
  console.log("communityId", communityId);
  console.log( mongoose.Types.ObjectId.isValid(communityId));
  
  if(!mongoose.Types.ObjectId.isValid(communityId)){
     throw new Error("communityId is not a valid ObjectId");
  }
  console.log(mongoose.Types.ObjectId.isValid(communityId));

  const existingCommunity = await Community.findById(communityId);

  if(!existingCommunity){
    throw new Error("community id is not found");
  }

  const user = await User.findById(userId);
  if(!user){
    throw new Error("user not found");
  }

  const updateUser = await User.findByIdAndUpdate(userId,
   {
   $addToSet: { joinedCommunities: communityId }
    },
    {new: true}
  );
  
  await Community.findByIdAndUpdate(communityId,{
    $addToSet: {members: userId},
  });

 const updatedCommunity = await Community.findById(communityId)
  .populate("members", "name email");

return {
  message: "joined successfully",
  joinedCommunities: updateUser.joinedCommunities,
  community: updatedCommunity,
};
}


//Upgrade user role
const makeHost = async (userId) => {
  await User.findByIdAndUpdate(userId,{
    $set:{ role: "host"},
  });
}

//leave community
const leaveCommunity = async({userId,communityId}) => {
  if(!communityId)
    throw new Error("community id is required");
  
  if(!mongoose.Types.ObjectId.isValid(communityId)){
    throw new Error("Invalid community id");
  }
  
  const community = await Community.findById(communityId);
  
  if (!community) {
    throw new Error("community not found");
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { joinedCommunities: communityId } },
    { new: true }
  );
  if (!updatedUser) {
  throw new Error("user not found");
}

  await Community.findByIdAndUpdate(communityId, {
    $pull: { members: userId },
  });
  const updatedCommunity = await Community.findById(communityId)
    .populate("members", "name email");

  return {
    message: "left successfully",
    joinedCommunities: updatedUser.joinedCommunities,
    community: updatedCommunity,
  };

}

//Dashboard
const dashboard = async(id) => {
  const dashboard = await User.findById(id)
  .select("name role joinedCommunities rsvpedEvents")
  .populate({ path: "joinedCommunities" , select: "name category description"})
    .populate({ path: "rsvpedEvents", select: "name city time mode",
      populate: {
        path: "communityId",
        select: "name",
      },
    }).lean();
    return dashboard;
}

//hostDashBoard
const getHostDashboard = async(id) => {
  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new Error("invalid user id");
  }
  const hostDashBoard = await User.findById(id)
  .select("name role joinedCommunities rsvpedEvents")
  .populate({ path: "joinedCommunities", select: "name category description"})
    .populate({path: "rsvpedEvents", select: "name city time mode",
      populate: {
         path: "communityId",
        select: "name",
      }
    }).lean();

    if(!hostDashBoard){
      throw new Error("user not found");
    }
  const myCreatedEvents = await Event.find({ host: id })
  .populate("communityId", "name")
  .lean();
  const hostedCommunities = await Community.find({host:id}).lean();
  hostDashBoard.hostedCommunities = hostedCommunities ;
  hostDashBoard.myCreatedEvents = myCreatedEvents;
  return hostDashBoard;
}


//toggleRSVP 

const toggleRSVP = async ({ user, eventId }) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("event id is not valid");
  }

  const eventObjectId = new mongoose.Types.ObjectId(eventId);

    const event = await Event.findById(eventObjectId);

 if (!event) throw new Error("Event not found");

const isAlready = user.rsvpedEvents.some(
  (id) => id.toString() === eventId
);

  if (isAlready) {
    user.rsvpedEvents.pull(eventObjectId);
     event.rsvpedUsers.pull(user._id);  
  } else {
    user.rsvpedEvents.push(eventObjectId);
    // prevent duplicate
    if (!event.rsvpedUsers.includes(user._id)) {
      event.rsvpedUsers.push(user._id);
    }
  }

  await user.save();
  await event.save(); 

  const events = await Event.find({
    _id: { $in: user.rsvpedEvents },
  }).populate("communityId", "name");

 return {
    rsvpedEvents: events,
    updatedEvent: await Event.findById(eventObjectId)
      .populate("rsvpedUsers", "name email"),
  };
};


//profile pic

const uploadProfilePic = async({userId,profileFilePath}) => {
  const user = await User.findByIdAndUpdate(
  userId,
  { profilePicUrl: profileFilePath },
  { new: true }
)

return user;
}
export default { registerUser,loginUser,joinCommunity,makeHost,leaveCommunity,dashboard,getHostDashboard,toggleRSVP,uploadProfilePic,resetPassword,forgotPassword };
