import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. Extract token from cookies or Authorization header
    const token = req.cookies?.accessToken || 
                 req.header("Authorization")?.replace("Bearer ", "");
    
    console.log("[JWT] Token:", token); // Debugging

    if (!token) {
      throw new ApiError(401, "Unauthorized access: No token provided");
    }

    // 2. Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("[JWT] Decoded:", decodedToken); // Debugging

    // 3. Find user - use cache if possible
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    // 4. Attach user to request
    req.user = user;
    next();

  } catch (error) {
    // Handle specific JWT errors
    let errorMessage = "Invalid access token";
    
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token format";
    }
    
    console.error("[JWT] Error:", errorMessage);
    throw new ApiError(401, errorMessage);
  }
});