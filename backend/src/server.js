import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
import path from "path"
const app = express();
import dbConnect from "./lib/dbConnect.js";
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // if you ever post form data

app.use(cookieParser());


app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
dbConnect();
const PORT = process.env.PORT || 5002;
const __dirname = path.resolve();


  app.use(express.static(path.join(__dirname,"../frontend/dist")));
  app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
  })

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
