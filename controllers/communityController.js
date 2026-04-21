import mongoose from "mongoose";
import communityService from "../services/communityService.js";
import Community from "../models/Community.js";
import User from "../models/User.js";
//create community
const createCommunity = async(req,res) => {
    try{
       const { name, description, category } = req.body;
       //taken host form middleware (anyone not able to create community)   
       const host = req.user._id
       const result = await communityService.createCommunity({name,description,host,category});
        res.json({
      data: {
        message: "community created successfully",
        hostedCommunities: result.hostedCommunities,
        community: result.community
      },
      error: null
    });
  
    }
    catch(error){
      console.log(error);
       res.json({error: {
         message:"failed to create community",
         info: error.message,
       },
      data:null
   })
    }
}

//Get all communities
const getAllCommunities = async(req,res) => {
 try{
   const communities = await communityService.getAllCommunities();
   res.json({data:{message:"All communities are successfully fetched", communities},error:null,});
 }
 catch(error){
  console.log(error);
   res.json({error:
    {
      message:"failed to fetch communities",
      info: error.message,
   },data:null,
 })
 }
}

//Get specific community 
const getSpecificCommunity = async(req,res) => {
  try{
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        data: null,
        error: { message: "community id is required" }
      });
    }
    const community = await communityService.getSpecificCommunity(id);
     res.status(200).json({
      data: { community },
      message: "community fetched successfully",
      error: null,
    });
  }
  catch(error){
    console.log(error);
    res.json({error:
    {
      message:"failed to get the specific communitiy",
      info: error.message,
   },data:null,
  })
  }
}


//Get specific community with members
const getCommunitywithMembers = async(req,res) => {
  try{
     const { id } = req.query;
      if (!id) {
      return res.status(400).json({
        data: null,
        error: { message: "community id is required" }
      });
    }
     const community = await communityService.getCommunitywithMembers(id);
    res.json({
  data: { community },
  message: "community fetched successfully",
  error: null
});
  }
  catch(error){
    console.log(error);
    res.json({error:
    {
      message:"failed to get the member of communitiy ",
      info: error.message,
   },data:null,
  })
  }
}

//Delete specific community
const deleteCommunity = async(req,res) => {
  try{
     const {id} = req.params;
      const result = await communityService.deleteCommunity({
      id,
      userId: req.user._id
    });
    res.json({data:{message:"successfully deleted", result},error:null});
  }
  catch(error){
    console.log(error);
res.json({
  data: null,
  error: {
    message: "failed to delete community",
    info: error.message
  }
});
  }
}
export default {createCommunity,getAllCommunities,getSpecificCommunity,getCommunitywithMembers,deleteCommunity};