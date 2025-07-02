import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

//Internal function to generate access and refresh tokens (no asyncHandler used because we are not using it in any web request)
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // We don't want to validate the user again while saving the refresh token(because save() will trigger the password validation again and we only want to save the refresh token)

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

//* coverimage is in user.routes.js file
//* coverImage is defined in user.model.js file also in below code 5.
const registerUser = asyncHandler(async (req, res) => {
  /*
    *  USER REGISTRATION WORKFLOW
    
    * 1️. Get user details from frontend 
    * 2️. Validate user details - not empty, valid email, password length, etc.    
    * 3️. Check if user already exists in the database: username or email
    * 4️. Check for images and avatar
    * 5️. Upload them to Cloudinary
    * 6️. Create user object - create entry in database
    * 7️. Remove password and refresh token field from response
    * 8️. Check if user is created successfully
    * 9️. Return res
    */

  //* 1️. Get user details from frontend
  const { email, fullname, username, password } = req.body;
  // console.log("Request Body: ",req.body);

  //* 2. Validation of user details
  /**
   * if(fullname === "") you can write 4 if statements like this or you can use the below code
   * .some() is used to check if any of the fields are empty and .trim() is used to remove any leading or trailing whitespace
   * '?' if any of the fields are empty, throw an error
   */
  if (
    [email, fullname, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //* 3. Check if user already exists in the database
  /**
   * User can directly interact with the database using Mongoose
   * findOne() method is used to find a single document in the database
   * $or operator is used to check if either username or email already exists
   */
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "Username or email already exits");
  }
  // console.log(req.files);

  //* 4. Check for images and avatar
  /**
   * req.files defaultly provided by multer middleware. It contains all the files uploaded in the request . Other methods : .single(), .array() etc.
   * .?.avatar[0]?.path checks if the avatar file is present in the request and gets the path of the first file uploaded in the 'avatar' field
   * If the avatar file is not present, it will return "undefined"
   */

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //console.log("Avatar Local Path: ",avatarLocalPath)
  //const coverImageLocalPath = req.files?.coverimage?.[0]?.path; (writing this will throw an error if coverImage is not present)

  let coverImageLocalPath = "";
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverImageLocalPath = req.files.coverimage[0].path;
  }

  if (!avatarLocalPath) {
    console.log("Failed path:", avatarLocalPath);
    throw new ApiError(400, "Avatar is required");
  }

  //* 5. Upload them to Cloudinary
  /*
   */
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  //* 6. Create user object - create entry in database
  /**
   * User.create() method is used to create a new user in the database
   * coverImage?.url || "" is used to check if coverImage is present, if not, it will set the coverImage to an empty string
   * Previously we checked for avatar as we have set it as mandatory field and coverImage is optional; So, if coverImage is not present, it will not throw an error and will set it to an empty string
   */
  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
  });

  //* 7,8: Remove password and refresh token field from response and check if user is created successfully
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) {
    throw new ApiError(500, "User creation failed");
  }

  //* 9. Return res
  return res
    .status(201)
    .json(new ApiResponse(201, userCreated, "User created successfully"));
});

//* User is a mongoose model that represents the user collection in the database
//* user is an instance of the User model that represents a single user document in the database
const loginUser = asyncHandler(async (req, res) => {
  /*
  * USER LOGIN WORKFLOW

  * 1. req body -> data
  * 2. username or email validation
  * 3. Check if user exists in the database
  * 4. Check if password is correct
  * 5. Generate access token and refresh token
  * 6. Return user data with tokens(with cookies)
  */

  //* 1. req body -> data
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }

  //* 2. username or email validation
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //* 3. Check if user exists in the database
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  //* 4. Check if password is correct using bcrypt method written in user.model.js
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  //* 5. Generate access token and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // use .select() to exclude password and refreshToken from the response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //* 6. Return user data with tokens(with cookies)
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  /*
   * USER LOGOUT WORKFLOW
   * 1. Remove refresh token from the user document in the database
   * 2. Set secure cookie options
   * 3. Clear access and refresh tokens from cookies
   * 4. Return success response
   */

  // 1. Remove refresh token from the user document in the database
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // 2. Set secure cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  // 3. Clear access and refresh tokens from cookies
  //* clearCookie() method is used to clear the cookie from the browser
  return res
    .status(200)
    .clearCookie("accessToken", options) // or .cookie("accessToken",null, options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "", "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  /*
   * REFRESH ACCESS TOKEN WORKFLOW
   * 1. Get refresh token from cookies
   * 2. Check if refresh token is present
   * 3. Check if refresh token is valid
   * 4. Generate new access token
   * 5. Return new access token
   */

  // 1. Get refresh token from cookies
  // req.cookies.refreshToken is used to get the refresh token from the cookies and req.body.refreshToken is used to get the refresh token from the request body(i.e if someone is using a mobile app or Postman)
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // 2. Check if refresh token is present
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  // 3. Check if refresh token is valid
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // user?.
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token expired or used.");
  }

  // Step 4 onwards is kept in try-catch block to handle any errors that may occur while generating new tokens. If any error occurs, it will be caught and handled in the catch block below

  try {
    // 4. Generate new access token
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // 5. Return new access token
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//-----------------change password controller-------------------
const changePassword = asyncHandler(async (req, res) => {
  /*
   *  CHANGE PASSWORD WORKFLOW
   
   * 1️. Get old and new password from request body.
   * 2️. Fetch the currently logged-in user using `req.user._id`.
   * 3️. Validate the old password using bcrypt compare.
   * 4️. If correct, set new password and save the user document.
   *     -> pre-save hook will hash it automatically.
   */

  // 1. Get old and new password from request body
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  // 2. Fetch the user from the DB using ID from JWT middleware
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 3. Check if old password is correct using method in user.model.js
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  // 4. Update password and save user
  user.password = newPassword;

  // NOTE: pre-save hook in user.model.js will hash this new password
  // Disable validation (optional if you're not modifying other fields)
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));
});

//-----------------get current user controller-------------------
const getCurrentUser = asyncHandler(async (req, res) => {
  //* Add more functionality to this function later
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

//-----------------update user controller-------------------
const updateUser = asyncHandler(async (req, res) => {
  /*   UPDATE USER WORKFLOW
   * 1️. Get user details from request body
   * 2️. Validate user details - not empty
   * 3️. Update user in the database
   */

  // 1️. Get user details from request body
  const { fullname, username, email } = req.body;

  // 2️. Validate user details - not empty
  if (!fullname || !username || !email) {
    throw new ApiError(400, "All fields are required");
  }

  // 3️. Update user in the database
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
        username,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

//-----------------file update like avatar and voverimage controller-------

/*
 * get req.files access from multer middleware
 * req.body from express
 * req.user from JWT middleware(auth middleware)
 */
const updateAvatar = asyncHandler(async (req, res) => {
  /**
   *
   */

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar");
  }

  //* TODO:Delete old avatar from Cloudinary after uploading new one

  // Update user avatar in the database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  /**
   *
   */

  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "Error uploading cover image");
  }

  // Update user avatar in the database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  /*
   * 1. Get username from request params
   * 2. Find user by username
   * 3. Aggregate subscribers and subscriptions
   * 4. Add subscribersCount, subscribedToCount, and isSubscribed fields
   */

  // 1. Get username from request params
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  // 2. Find user by username
  //User.find({username}) can be used then we aggregate the result based on id of the user so instead of this we can use aggregation pipeline lke below-----

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions", // The collection to join with
        localField: "_id", // Field from the input documents
        foreignfield: "channel", // Field from the documents of the "from" collection
        as: "subscribers" // Output array field
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localfield: "_id",
        foreignfield: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        sucribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { 
              $in:[
                req.user?.id, //Check if the current user id is in the subscribers array
                "$subscribers.subscriber" //$subscribers(field) is an array of objects of "subcriber"(from model) and we are checking if the current user id is in the "subscriber" field of the objects in the "subscribers" array
              ]
            },
            thrn : true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        sucribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1
      }
    }
  ])

  if(!channel?.length)
  {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));



});

const getWatchHistory = asyncHandler(async(req,res) => {
  /**
   * 
   */

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localfield: "watchHistory",
        foreignfield: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: { 
              from: "users",
              localfield: "owner",
              foreignfield: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {$first: "$owner"}
            }
            
          }
        ]
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
    
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUser,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile, // Subscriber count and subscription count
  getWatchHistory
};
