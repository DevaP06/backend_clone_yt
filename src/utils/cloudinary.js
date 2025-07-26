import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const uploadOnCLoudinary = async (filePath) => {
    try {
        if(!filePath){
            return null;
        }
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
        console.log('Video uploaded successfully:', result.response_url);
        fs.unlinkSync(filePath); // Delete the file after upload
        return result;
    } catch (error) {
        fs.unlinkSync(filePath);
         console.error("Cloudinary Upload Error:", error);
        return null;
    }
}