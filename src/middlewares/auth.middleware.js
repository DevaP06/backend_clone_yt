import {asyncHandeler} from '../utils./asyncHandler.js'
import jwt, { decode } from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { APIError } from '../utils/apiError';

export const verifyJWT = asyncHandeler(async (req, res, next) => {
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token)
        {
            throw new APIError(401, "Unauthorized request");
        }
    
        const decodedToken=jwt.verify(token, process.env.JWT_SECRET_KEY);
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user) {
            throw new APIError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new APIError(401,"Unauthorized access Token");
        
    }
})
