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


export default connectDB
.then(()=> {
    application.listen(process.env.PORT||8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
        })
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
    
})
