import asyncHandler from "express-async-handler";
import {APIError} from "../utils/apiError.js";
import {user} from "../models/user.model.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
   const { username, email, fullName, password } = req.body;
   if(!username || !email || !fullName || !password) {
       throw new APIError(400, "All fields are required");
   }

   const existedUser=user.findOne({
    $or: [{ email: email }, {username: username }]
   })
    if (existedUser) {
         throw new APIError(408, "User already exists");
    }
   const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    const avatar=await uploadOnCLoudinary(avatarLocalPath);
    const coverImage=await uploadOnCLoudinary(coverImageLocalPath);

    if(!avatar)
    {
        throw new APIError(400, "Avatar upload failed");

    }
     const user=await user.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.coverImage.url| "",
     })
    
     const createdUser= await user.findById(user._id).select("-password -refreshToken");
     if(!createdUser) {
         throw new APIError(500, "Something went wrong while registering usser");
     }

     return res.status(201).json(new APIResponse(200, "User registered successfully", createdUser,));
})

 

    

export { registerUser };