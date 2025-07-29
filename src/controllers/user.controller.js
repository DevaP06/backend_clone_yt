import asyncHandler from "express-async-handler";
import {APIError} from "../utils/APIError.js";
import {User} from "../models/user.models.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken";
import { deleteOldCloudinary } from "../utils/deleteoldcloudinary.js";



const generateAccessRefreshToken = async(userId)=>{
    let accessToken, refreshToken;
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new APIError("User not found for token generation", 404);
        }
        accessToken = user.generateAccessToken();
        refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

    } catch (error) {
        throw new APIError(500, "Error generating tokens");
    }
    return {accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
   const { username, email, fullName, password } = req.body;
   if(!username || !email || !fullName || !password) {
       throw new APIError(400, "All fields are required");
   }

   const existedUser=await User.findOne({
    $or: [{ email: email }, {username: username }]
   })
    if (existedUser) {
         throw new APIError(408, "User already exists");
    }
   const avatarLocalPath=req.files?.avatar?.[0]?.path;
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

    const avatar=await uploadOnCLoudinary(avatarLocalPath);
    const coverImage=await uploadOnCLoudinary(coverImageLocalPath);

    if(!avatar)
    {
        throw new APIError(400, "Avatar upload failed");

    }
     const user=await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url|| "",
     })
    
     const createdUser= await User.findById(user._id).select("-password -refreshToken");
     if(!createdUser) {
         throw new APIError(500, "Something went wrong while registering usser");
     }

     return res.status(201).json(new APIResponse(200, "User registered successfully", createdUser,));
})

 


const loginUser = asyncHandler(async (req, res) => {
    //req.body-= data
    //username or email
    //cheeck if user exists
    //check password
    //generate access token and refresh token
    //send response with tokens
    

    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
        throw new APIError(400, "Username or Email and Password are required");
    }

    const identifier = usernameOrEmail.trim().toLowerCase();

    const user=await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    })

    if(!user) {
        throw new APIError(404, "User not found");
    }
    const isPasswordMatch = await user.isPasswordCorrect(password);
    if (!(isPasswordMatch)) {
        throw new APIError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
    const options={
        secure:true,
        httpOnly:true,
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new APIResponse(200,
        {
            user: loggedInUser,accessToken,
            refreshToken
        }
         ,"User logged in successfully", loggedInUser
     )

    )


})
    

const logoutUser = asyncHandler(async(req,res)=> {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set:{
                refreshToken: undefined
            }  
        },
        {
            new: true 
        }
    )

    const options = {
        secure: true,
        httpOnly: true,
      
    };
    return res.status(200).cookie("accessToken", "", options).cookie("refreshToken", "", options).json(new APIResponse(200, "User logged out successfully"));
})


const refreshAccesstoken=asyncHandler(async(req,res)=>{
    const refreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!refreshToken) {
        throw new APIError(401, "Refresh token is required");
    }

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) {
        throw new APIError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
        throw new APIError(404, "User not found");
    }

    const { accessToken } = await generateAccessRefreshToken(user._id);
    
    return res.status(200).json(new APIResponse(200, "Access token refreshed successfully", { accessToken }));

})



const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new APIError(400, "Current password and new password are required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new APIError(404, "User not found");
    }

    const isPasswordMatch = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordMatch) {
        throw new APIError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new APIResponse(200, "Password changed successfully")); 
})



const getCurrentuser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new APIResponse(200, "Current user fetched successfully", req.user));
})


const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;
    if(!fullName || !email) {
        throw new APIError(400, "Full name and email are required");
    }
    const user=User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");
    if(!user) {
        throw new APIError(404, "User not found");
    }
    return res.status(200).json(new APIResponse(200, "Account details updated successfully", user));

})


const updatUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar is required");
    }

    const avatar = await uploadOnCLoudinary(avatarLocalPath);
    if (!avatar) {
        throw new APIError(400, "Avatar upload failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.secure_url } },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new APIError(404, "User not found");
    }
    deleteOldCloudinary(req.user.avatar); // Delete old avatar from Cloudinary
    return res.status(200).json(new APIResponse(200, "Avatar updated successfully", user));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!coverImageLocalPath) {
        throw new APIError(400, "Cover image is required");
    }

    const coverImage = await uploadOnCLoudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new APIError(400, "Cover image upload failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverImage: coverImage.secure_url } },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new APIError(404, "User not found");
    }
    deleteOldCloudinary(req.user.coverImage); // Delete old cover image from Cloudinary
    return res.status(200).json(new APIResponse(200, "Cover image updated successfully", user));
})


export { registerUser
, loginUser
,logoutUser
, refreshAccesstoken
,changeCurrentPassword
,getCurrentuser
, updateAccountDetails
,updatUserAvatar
, updateUserCoverImage

};