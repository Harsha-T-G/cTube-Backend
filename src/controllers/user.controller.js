import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //To Register We Need
  //get user details from frontend
  //validation - not empty
  //check if user already exists : username, email
  // files exists or not - avatar
  //upload them to cloudinary
  //check in multer
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  //   return res

  const { fullName, username, email, password } = req.body;
  //   console.log(email);
  if (
    [fullName, email, username, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Multiple User Found email with another found");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.file?.coverImage?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Not Found");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Not Found");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
  });
  const findUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!findUser) {
    throw new ApiError(500, "Something went wrong while regestering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registerd Successfully"));
});

export { registerUser };
