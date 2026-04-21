import communityService from "../services/communityService.js";
import eventService from "../services/eventService.js";
//Create all events
const createEvent = async (req,res) => {
    try{
        const {name,description,city,venue,time,communityId,capacity,mode,meetingLink} = req.body;
        const host = req.user._id;
        const event = await eventService.createEvent({name,description,city,venue,time,communityId,capacity,host,mode,meetingLink});
        res.json({
            data: {
                message: "event created successfully",event
            },
            error: null,
        });
    }
    catch(error){
        console.log(error.message);
        res.json({
  data: null,
  error: {
   message: "Event creation failed",
    info: error.message
  }
});
    }
}

//Get all events
const getAllEvents = async(req,res) => {
try{
  const { city,keyword } = req.query;
  const events = await eventService.getAllEvents({city,keyword});
  res.json({data:{message: "successfully fetched list of all filtered events",events}, error:null});
}
catch(error){
    console.log(error.message);
    res.json({error:{
        message: "unable to fetch list of filtered events",
        info:error.message,
    },data:null});
 }
}

//Get specific event 
const getSpecificEvent = async(req,res) => {
  try{
       const { id } = req.query;
       const event = await eventService.getSpecificEvent(id);
       res.json({data:{message: "fetched specific event successfully",event},error:null});
  }
  catch(error){
     console.log(error.message);
     res.json({
      data: null,
      error: {
        message: "failed to get specific event",
        info: error.message
      }
    });
  }
}

//deleteEvent
const deleteEvent = async(req,res) => {
    try{
        //id means eventId
        const {id} = req.params;
        await eventService.deleteEvent({ id, userId: req.user._id,});
        res.json({data:{message: "successfully deleted event"},error:null});
    }
    catch(error){
        console.log(error);
        res.json({error:{
            message: "failed to delete event",
            info: error.message,
        },data:null});
    }
}
export default { createEvent,getAllEvents,getSpecificEvent,deleteEvent };
