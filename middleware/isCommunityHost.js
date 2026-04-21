import Community from "../models/Community.js";
import mongoose from "mongoose";

export const isCommunityHost = async(req,res,next) => {
    try{
        const {communityId} =   req.body
        
        if(!communityId){
            return res.json({error:{message:"communityId is required"}, data: null,});
        }

        if(!mongoose.Types.ObjectId.isValid(communityId)){
            return res.json({error: {message: "invalid community id"}, data: null,});
        }

        const community = await Community.findOne({
            _id: communityId,
            host: req.user._id
        });
     
        if(!community){
            return res.json({error:{
            message: "not authorized ",
            },data:null})
        }
        next();
    }
    catch(error){
        return res.json({error: {message:"failed to access community"},data:null,});
    }
}
