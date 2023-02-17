const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const { get } = require("mongoose");
const mailHelper = require("../utils/email@helper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  let result;
  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("Name, email, password are required", 400));
  }
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  //check for presence of password
  if (!email || !password) {
    return next(new CustomError("please provid email and password", 400));
  }

  //getting user from database
  const user = await User.findOne({ email }).select("+password");
  //if user is not found in DB
  if (!user) {
    return next(
      new CustomError("Email or password does not match or exist", 400)
    );
  }

  // match the password
  const isPasswordCorrect = await user.isValidatedPassword(password);

  // if password do not match
  if (!isPasswordCorrect) {
    return next(
      new CustomError("Email or password does not match or exist", 400)
    );
  }

  //if all goes good and we send the token
  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout success",
  });
});

exports.forgotpassword = BigPromise(async (req, res, next) => {
  //collect email
  const { email } = req.body;

  // find user in database
  const user = await User.findOne({ email });

  //if user not found in data base
  if (!user) {
    return next(new CustomError("Email not found as registered", 400));
  }

  //got token from user model methods
  const forgotToken = user.getForgotPasswordToken();

  //save user field in DB
  await user.save({ validateBeforeSave: false });

  //create URL
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;
  //craft a message
  const message = `Copy paste link in your URL and hit enter \n\n ${myUrl}`;

  //attempt to send mail
  try {
    await mailHelper({
      email: user.email,
      subject: "LCO Tstore - Password reset email",
      message,
    });

    //json response if email is success
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    //reset user fields if things goes wrong
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  //get token from params
  const token = req.params.token;

  // hash the token as db also stores the hashed version
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  // find user based on hased on token and time in future
  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  // check if password and conf password matched
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("password and confirm password do not match", 400)
    );
  }

  // update password field in DB
  user.password = req.body.password;

  // reset token fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  // save the user
  await user.save();

  // send a JSON response OR send token

  cookieToken(user, res);
});
