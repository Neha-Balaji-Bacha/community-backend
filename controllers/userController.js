// //process the request and send the response.
//Register
import Event from "../models/Event.js";
import eventService from "../services/eventService.js";
import userService from "../services/userService.js";
import User from "../models/User.js";
const register = async(req,res) => {
    try{
        const {name,email,password} = req.body;
        const token = await userService.registerUser({name,email,password});
        res.clearCookie("token"); 
        res.cookie("token" ,token,{
            httpOnly: true,
            //secure: true//keep it for PRODUCTION
            secure:true,
            sameSite:"lax",//lax,strict,none
            maxAge: 1*24*60*60*1000//1day
        })
            const user = await User.findOne({ email }).select("_id name email role");

    res.json({
      data: {
        message: "User registered successfully",
        user,
      },
      error: null,
    });

    }
    catch(error){
        console.log(error.message);
        res.json({
  data: null,
  error: {
    message: error.message
  }
});
    }
};

//Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginData = await userService.loginUser({ email, password });

    res.cookie("token", loginData.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.json({
      data: {
        message: "user logged in successfully",
        user: loginData.user,
        hostedCommunities: loginData.hostedCommunities,
        joinedCommunities: loginData.joinedCommunities,
      },
      error: null,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      data: null,
      error: {
        message: "Login failed",
        info: error.message,
      },
    });
  }
};


// ================== FORGOT PASSWORD ==================
const forgotPassword = async (req, res) => {
  try {
  const { email } = req.body;

const resetUrl = await userService.forgotPassword(email);
res.json({
  data: {
    message: "If account exists, reset link sent",
    resetUrl: resetUrl || null 
  },
  error: null
});

  } catch (error) {
    res.json({
      data: null,
      error: { message: error.message }
    });
  }
};


// ================== RESET PASSWORD ==================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await userService.resetPassword(token, password);

    // clear login cookie after reset
   res.clearCookie("token", {
  httpOnly: true,
  secure: true, // true in production
  sameSite: "lax",
});

    res.json({
      data: {
        message: "Password reset successful"
      },
      error: null
    });

  } catch (error) {
    res.status(400).json({
      data: null,
      error: { message: error.message }
    });
  }
};

const profile = async (req, res) => {
  try {
    // If not logged in - return empty user
    if (!req.user) {
      return res.json({
        data: {
          user: null,
          joinedCommunities: [],
          hostedCommunities: [],
          rsvpedEvents: [],
          myCreatedEvents: [],
        },
        error: null,
      });
    }

    //Fetch user
    const user = await User.findById(req.user._id)
      .select("name email role profilePicUrl joinedCommunities hostedCommunities rsvpedEvents")
      .populate("joinedCommunities")
      .populate("hostedCommunities")
      .populate({
        path: "rsvpedEvents",
        populate: { path: "communityId", select: "name" }
      });

    //Fetch events created by user
    const myCreatedEvents = await Event.find({ host: req.user._id })
      .populate("communityId", "name");

    //  Send response
    res.json({
      data: {
        user,
        joinedCommunities: user.joinedCommunities,
        hostedCommunities: user.hostedCommunities,
        rsvpedEvents: user.rsvpedEvents,
        myCreatedEvents,
      },
      error: null,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      data: null,
      error: { message: error.message },
    });
  }
};

//Join Community
const joinCommunity = async(req,res) => {
  try{
    if (!req.user) {
      return res.status(401).json({
        data: null,
        error: { message: "User not logged in" },
      });
    }

    const {communityId} = req.query;

    console.log("USER:", req.user);
    console.log("USER ID:", req.user._id);
    console.log("COMMUNITY ID:", communityId);

    if (!communityId) {
      return res.status(400).json({
        data: null,
        error: { message: "communityId is required" },
      });
    }

    const result = await userService.joinCommunity({
      userId: req.user._id,
      communityId
    });

    res.json({
      data: result,
      message: "successfully joined community",
      error: null
    });

  } catch(err){
    console.log("JOIN ERROR:", err.message);

    res.json({
      error: {
        message: "failed to add user in community",
        info: err.message,
      },
      data: null,
    });
  }
}


//Make Host : Upgrade user role
const makeHost = async (req,res) => {
  try{
    const userId = req.user._id;
    await userService.makeHost(userId);
    res.json({
      data: {
        message: "user role changed to host",
      },
      error: null,
    });
  }
  catch(error){
    console.log(error);
    res.json({
      error: {
        message: "failed to upgrade user to host",
        info: error.message,
      },
      data: null,
    });
  }
}

//Logout
const logout = (req,res) => {
  try{
    res.clearCookie(
      "token", {
         httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/", 
      });  
      return res.json(
        {data:{message: "logged out successfully"},error:null}
      )
    }
    catch(error){
      res.json({data:null,error:{message:"failed to logout",info: error.message}});
    }
  }
  
  //leave community
  const leaveCommunity = async(req,res) => {
    try{
    const { id } = req.params;
    const result = await userService.leaveCommunity({
      userId: req.user._id,
      communityId: id
    });
    res.json({
  data: result,
  message: "successfully left community",
  error: null
});
  }
  catch(error){
    res.json({data:null,error:{
      message: "failed to leave community",
      info: error.message
    }
  })
}
}

//Dashboard : member
const dashboard = async(req,res) => {
  try{
    const {_id:id} = req.user;
    const dashboard = await userService.dashboard(id);
    console.log("DASHBOARD DATA:", dashboard.rsvpedEvents);
    res.json({
        data:dashboard,
        message: "successfully fetched the member dashboard",
        error:null,
    });
  }
  catch(error){
    console.log(error);
    res.json({
      error:{
        message: "failed to fetch the member dashboard",
        info: error.message,
      },data: null,
    });
  }
}

//getHostDashboard
const getHostDashboard = async(req,res) => {
  try{
    const {_id:id} = req.user;
    const hostDashBoard = await userService.getHostDashboard(id);
     res.json({
      data: hostDashBoard, 
      message: "fetched the host dashboard successfully",
      error: null,
    });
  }catch(error){
    console.log(error);
    res.json({
      error: {
        message : "unable to fetch host dashboard",
        info: error.message,
      },data: null,
    })
  }
}

//toggleRsvp

const toggleRSVP = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) throw new Error("eventId required");

    const user = req.user;

    const updatedUser = await userService.toggleRSVP({
      user,
      eventId,
    });

    res.json({
      data: {
      message: "RSVP updated",
        rsvpedEvents: updatedUser.rsvpedEvents,
        updatedEvent: updatedUser.updatedEvent,
      },
      error: null,
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      data: null,
      error: {
        message: "failed to RSVP",
        info: error.message,
      },
    });
  }
};


//profile pic
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("file is required");
    }

    if (!req.file.mimetype.startsWith("image/")) {
      throw new Error("only images are allowed");
    }

    const profileFilePath = `/uploads/${req.file.filename}`;
    const userId = req.user._id;

    const updatedUser = await userService.uploadProfilePic({
      userId,
      profileFilePath,
    });

    res.json({
      data: {
        message: "profile pic uploaded successfully",
        profilePicUrl: profileFilePath,
        user: updatedUser,
      },
      error: null,
    });

  } catch (error) {
    console.log(error);
    res.json({
      error: {
        message: "pic failed to upload",
        info: error.message,
      },
      data: null,
    });
  }
};
export default {register,login,joinCommunity,makeHost,profile,logout,leaveCommunity,dashboard,getHostDashboard,toggleRSVP,uploadProfilePic,resetPassword,forgotPassword};