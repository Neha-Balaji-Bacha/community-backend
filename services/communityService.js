import Community from "../models/Community.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Event from "../models/Event.js";
//create community
const createCommunity = async({name,description,host,category}) => {
   const inputErrors = [];
   if(!name) inputErrors.push("name cannot be empty");
   if(!description) inputErrors.push("description cannot be empty");
   if(!host) inputErrors.push("host cannot be empty");
   if(!category) inputErrors.push("category cannot be empty");

   if(inputErrors.length) throw new Error(inputErrors.join(", "));

   if(!mongoose.Types.ObjectId.isValid(host)){
        throw new Error("host id is not a valid ObjectId");
   }

   const community =  await new Community({name,description,host,category}).save();
     const updatedUser = await User.findByIdAndUpdate(
    host,
    { $addToSet: { hostedCommunities: community._id } },
    { new: true }
  ).populate("hostedCommunities", "_id name category");

  return {
    community,
    hostedCommunities: updatedUser.hostedCommunities
  };
};

//Get all communities
const getAllCommunities = async () => {
  const communities = await Community.find().lean();

  const communitiesWithCount = await Promise.all(
    communities.map(async (community) => {
      const eventsCount = await Event.countDocuments({
        communityId: community._id,
      });

      return {
        ...community,
        eventsCount,
      };
    })
  );

  return communitiesWithCount;
};

//Get specific community
const getSpecificCommunity = async(id) => {
   if(!mongoose.Types.ObjectId.isValid(id)){
        throw new Error("community id is not a valid");
   }
   // const community = await Community.findById(id);
   const community = await Community.findById(id)
   .populate({
      path: "host",
      select: "name _id",
   })
   .populate({
      path: "members",
      select: "name email _id",
   }).lean();
   
   // If we want to manipulate data we can do that
   //community.host = community.host.name;
    if (!community) {
      throw new Error("community not found");
   }
   return community;
}

//Get community with members (count) : join community
const getCommunitywithMembers = async(id) => {
   if(!mongoose.Types.ObjectId.isValid(id)){
      throw new Error("community id is not a valid mongoose ObjectId");
   }
   const community = await Community.findById(id)
  .populate("members", "name email")
  .populate("host", "name")
  .lean();

if (!community) {
  throw new Error("no community exists with this id");
}

return community;

   //$in check if any elements matches
   // const members = await User.find({
   //    joinedCommunities:{
   //    $in: [id, "69ba7b3587c5011898dc7ed6"],
   //    },
   // });

   //$all check if all elements matches
   // const members = await User.find({
   //    joinedCommunities:{
   //    $all: [id, "69ba7b3587c5011898dc7ed6"],
   //    },
   // });
}

//Delete Community
const deleteCommunity = async ({ id, userId }) => {

  const community = await Community.findById(id);
  if (!community) {
    throw new Error("community not found");
  }

  //check host
   if (community.host.toString() !== userId.toString()) {
    throw new Error("unauthorized: only host can delete");
  }


  await Community.findByIdAndDelete(id);

  await Event.deleteMany({ communityId: id });

  await User.updateMany(
    { joinedCommunities: id },
    { $pull: { joinedCommunities: id } }
  );

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { hostedCommunities: id } },
    { new: true }
  );

  return {
    message: "community deleted successfully",
    hostedCommunities: updatedUser.hostedCommunities,
    joinedCommunities: updatedUser.joinedCommunities
  };
};
export default {createCommunity,getAllCommunities,getSpecificCommunity,getCommunitywithMembers,deleteCommunity};
 