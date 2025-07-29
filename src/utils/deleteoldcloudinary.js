import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteOldCloudinary =async (filePath) => {
    try {
        if (!filePath) {
            return null;
        }
        // Extract the public ID from the file path
        const publicId = filePath.split('/').pop().split('.')[0];
        
        // Delete the file from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto",
        });
        
        console.log('File deleted successfully:', result);
        return result;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return null;
    }
}