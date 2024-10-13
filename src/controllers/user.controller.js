import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadFileCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    // get user details from frontend.
    const {username, email, fullName, password} = req.body
    console.log("username : ",username)

    // Validating Data.
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // Check if user alredy exists.
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already existed.")
    }
    
    // Checking for images or avatars.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    // Uplaod avatar and coverImage to Cloudinary.
    const avatar = await uploadFileCloudinary(avatarLocalPath)
    const coverImage = await uploadFileCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar field is required")
    }

    // Create user object and create entry in DB.
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })

    // Remove password and refreshToken from DB fields.
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // Check for user creation.
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating entry in DB.")
    }

    //Return Response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered sucessfully")
    )

} )

export {registerUser}