import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const dbConnect = async()=>{
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Connected to MongoDB");
        console.log(`MongoDB connected: ${connect.connection.host}`);
        console.log(`MongoDB connected: ${connect.connection.name}`);
    } catch (error) {
        console.log("MongoDB connection error: ",error);process.exit(1);
    }
}
export default dbConnect;