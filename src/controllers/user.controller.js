import asyncHandler from "express-async-handler";
import {APIError} from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";




const generateAccessRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

    } catch (error) {
        throw new APIError(500, "Error generating tokens");
    }
    return { accessToken, refreshToken };
}

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

    const user=await User.findOne({
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail.toLowerCase() }]
    })

    if(!user) {
        throw new APIError(404, "User not found");
    }
    const isPasswordMatch = await user.isPasswordCorrect(password);
    if (!isPasswordMatch) {
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

export { registerUser
, loginUser
,logoutUser

 };