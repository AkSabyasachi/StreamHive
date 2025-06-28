import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password: {
      type: String,
      required: [true, 'Password is required!!'],
    },
    refreshToken: {
      type: String,
    }
  },{ timestamps: true}
)

/*
 * this bcrypt middleware hashes the password before saving the user document
 * mongoose middleware is a function that is executed at a certain stage of the document lifecycle, .pre('save') is called before saving the document
*/

userSchema.pre("save", async function(next) 
  {

  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

/*
  *.methods is used to define "custom methods" on the schema
  *this method is used to check if the password provided by the user matches the hashed password stored in the database
  *bcrypt.compare() compares the plain text password with the hashed password

  *here insetad of using arrow function, we use normal function to access the 'this' keyword which refers to the current document
*/

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password,this.password)
}

/*
  * Generates a JWT "access" token for the user
  * The token includes the user's ID, email, username, and fullname
 */

userSchema.methods.generateAccessToken = function() {
  //*jwt.sign(payload, secret, options)
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

/*
  * Generates a JWT "refresh" token for the user
  * This token is used to obtain new access tokens when the current one expires
*/

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User",userSchema);