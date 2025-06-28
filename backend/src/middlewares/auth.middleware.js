import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = asyncHandler(async(req,res,next) => 
  {

  try {
    // Extract token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
  
    // If token is not present, throw an error
    if(!token)
    {
      throw new ApiError(401,"Unauthorized access")
    }
  
    // Verify if provided token is valid
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
    // A db query to find the user by ID from the decoded token
    // If user is not found or token is invalid, throw an error
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user)
    {
      throw new ApiError(401,"Invalid Access Token")
    }
  
    req.user = user; // Attach user to the request object
    next();

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }

})