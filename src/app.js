import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "10kb"
}))

app.use(express.urlencoded({
    limit: "10kb"
}))

app.use(cookieParser());

//route import
import userRouter from "./routes/user.route.js";


//routes declaration
app.use("/api/v1/users",userRouter)

export {app};