import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.URI_KEY}/${DB_NAME}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) { 
    console.log("MONGODB connection error",error);
    process.exit(1);
    }
}


export default connectDB;
