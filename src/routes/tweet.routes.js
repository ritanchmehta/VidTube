import {Router} from "express";

import { createTweet,getUserTweets,updateTweet, deleteTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT, createTweet);
router.route("/get-user-tweets/:userId").get(verifyJWT, getUserTweets);
router.route("/update-tweet/:tweetId").patch(verifyJWT,updateTweet).delete(verifyJWT, deleteTweet);


export default router;