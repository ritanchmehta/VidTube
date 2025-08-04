import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    //getting it from logged in user
    const subscriberId = req.user._id;

    /*
    channelId: The ID of channel we want to subscribe or unsubscribe
    subscriberId: The Id of user logged in
    */

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel ID");
    }

    if(subscriberId.toString() === channelId.toString()){
        throw new ApiError(400,"User cannot subscribe to there own channel");
    }

    //If subscription already exists then unsubscribe and vice versa

    const existedSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if(existedSubscription){
        //Unsubscribe
        await Subscription.findByIdAndDelete(existedSubscription._id);
        return res
            .status(201)
            .json(new ApiResponse(201),{}, "Unsubscribed succesfully")
    }

    await Subscription.create({ subscriber: subscriberId, channel: channelId});
    return res
        .status(201)
        .json(new ApiResponse(201,{}, "Subscribed succesfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
    }

    /*
        Fetch all subscribers of the channel from the Subscription collection.
        - `Subscription.find({ channel: channelId })` finds all documents where the channel matches the given ID.
        - `.populate("subscriber", "_id name email")` replaces the `subscriber` field (which is just an ID) with full details (ID, name, email).
  */

  const subscribersDocs = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "_id name email");

  if (!subscribersDocs) {
    throw new ApiError(404, "No subscribers found for this channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribersDocs, "Subscribers fetched successfully")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;

    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId,
      }).populate("channel", "_id name email");
    
      // If no subscribed channels found, return an error
      if (!subscribedChannels || subscribedChannels.length === 0) {
        throw new ApiError(404, "No subscribed channels found");
      }

      /*  Why are we checking `subscribedChannels.length === 0`?
     - `.find()` always returns an array. If empty, that means no subscriptions exist.
     - Without this check, the user might receive an empty array instead of a proper message.
  */

     return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}