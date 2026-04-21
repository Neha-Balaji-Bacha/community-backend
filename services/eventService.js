import mongoose from "mongoose";
import Event  from "../models/Event.js";
import Community from "../models/Community.js";
import User from "../models/User.js";
//create an event
const createEvent = async ({name,description,city,venue,time,communityId,host,capacity,mode,meetingLink}) => {
    const inputErrors = [];

    if(!name) inputErrors.push("name is required");
    if(!time) inputErrors.push("time is required");
    if(!communityId) inputErrors.push("communityId is required");
    if (!description) inputErrors.push("description is required");
    if(description?.length > 1000) inputErrors.push("description length cannot be more than 1000");

    if(!mode) inputErrors.push("mode is required");

    if(mode === "offline"){
        if(!city) inputErrors.push("city is required for offline events");
        if(!venue) inputErrors.push("venue is required for offline events");
    }
    
    if(mode === "online"){
      if(!meetingLink)
        inputErrors.push("meeting link is required for online events");
    }
    
    if(inputErrors.length) throw new Error(inputErrors.join(", "));
    const communityExists = await Community.findById(communityId);
    if (!communityExists) {
      throw new Error("Invalid community");
    }
    
    const eventTime = new Date(time);
    
    if(eventTime < new Date()) throw new Error("event time must be in future");
    

    const event = new Event({name,description,city,venue,time:eventTime,communityId,host,capacity,mode,meetingLink});
    
    //Only set capacity if user has provided it
    // if (capacity) event.capacity = capacity;
    
    // Convert incoming time into a proper JavaScript Date object
    // event.time = new Date(time);
    
    const savedEvent = await event.save();
    await savedEvent.populate({path: "communityId",select: "name"});
    return savedEvent;
}

//Get all events
const getAllEvents = async({city,keyword}) => {
  const filter = {
    time: {$gte: new Date()}, //if(event.time >= currentTime) only gives upcoming events
  };

  if(city) {
    filter.city =  {$regex: city, $options: "i"}
  };

  if(keyword){
    filter.$or = [
      {name: {$regex: keyword, $options: "i"}},
      {description: {$regex: keyword, $options: "i"}},
    ];
  }
  const events = await Event.find(filter).lean();
  return events;
}

//Get specific event by id
const getSpecificEvent = async(id) => {
  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new Error("event id is not valid");
  }

  const event = await Event.findById(id)
  .populate({
    path: "communityId",
    select: "name host",
    populate: {path: "host", select:"name"},
  })
  .populate("host", "name")
   .populate("rsvpedUsers", "name email");

  if(!event)
    throw new Error("event is not found");

  return event;
}

//deleteEvent
const deleteEvent = async ({ id, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("given event id is not valid");

  const event = await Event.findById(id).lean();
  console.log({ event });

  if (!event) throw new Error("no event exists with this id");

  const community = await Community.findById(event.communityId).lean();

  if (community?.host.toString() !== userId.toString())
    throw new Error("current user is not the host of this event");

  await Event.findByIdAndDelete(id);

  await User.updateMany(
    { rsvpedEvents: id },
    {
      $pull: { rsvpedEvents: id },
    }
  );
};
 
export default {createEvent, getAllEvents,getSpecificEvent,deleteEvent};
