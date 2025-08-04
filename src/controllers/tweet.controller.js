import { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
// import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const ownerId = req.user._id;

    //validation
    if(content.trim() ===""){
        throw new ApiError(400,"Tweet content cannot be empty");
    }

    const newTweet = await Tweet.create({
        content,
        owner: ownerId
    }) 

    //if something goes wrong while creating tweet
    if(!newTweet){
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    return res
            .status(201)
            .json(new ApiResponse(200, newTweet, "Tweet created successfully"));


})

const getUserTweets = asyncHandler(async (req, res) => {
    
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
      }
    

    // We also sort the tweets by 'createdAt' in descending order (-1) to show the latest tweets first
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    if (!tweets || tweets.length === 0) {
        throw new ApiError(404, "Tweets are not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if(!content?.trim()){
        throw new ApiError(400,"Content cannot be empty");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweet = await Tweet.findById(tweetId);
    
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

     /*
    - Users should only be able to edit their own tweets.
    - Convert ObjectIds to strings before comparing.
    */
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only update your own tweets");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
          $set: {
            content
          }
        },
        { new: true }
      );

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating the tweet");
    }

    return res
            .status(201)
            .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own tweets");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(500, "Something went wrong while deleting the tweet");
    }

    return res.status(200).json(new ApiResponse(200, {},"Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}