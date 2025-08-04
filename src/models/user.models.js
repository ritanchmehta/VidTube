
/*
id string pk
  username string
  email string
  fullName string
  avatar string
  coverImage string
  watchHistory ObjectId[] videos
  password string
  refreshToken string
  createdAt Date
  updatedAt Date
*/

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        //we don not have to mention the _id because mongodb handles that by itself
        username: {
            type: String,
            required: true,
            unique: true ,
            lowercase: true,
            trim: true,
            index: true 
        },
        email: {
            type: String,
            required: true,
            unique: true ,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudnary URL
            required: true
        },
        coverImage: {
            type: String, //cloudnary URL
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "password is required"] //in required we can always mention the error message if the required filed is not there 
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true} //this adds the createdAt and updatedAt fields automatically
);

userSchema.pre("save", async function(next){
    
    if(!this.isModified("password")) return next(); // proceed only if password field is changed

    this.password = await bcrypt.hash(this.password, 10)

    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
    // short lived access token
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
}

userSchema.methods.generateRefreshToken = function (){
    // short lived access token
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
}

export const User = mongoose.model("User", userSchema);