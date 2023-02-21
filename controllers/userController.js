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

exports.userDashboard = BigPromise(async (req, res, next) => {
  //grabbing user id
  const user = await User.findById(req.user.id);

  //sending a user detail as response
  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  //getting user id
  const userId = req.user.id;

  //select the password field from user
  const user = await User.findById(userId).select("+password");

  //checking the old password is correct or not
  const isOldPasswordCorrect = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isOldPasswordCorrect) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  //sending a new password
  user.password = req.body.password;

  //seving the user
  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  //gettig a updeted data from user
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  //checking files
  if (req.files) {
    const user = await User.findById(req.user.id);

    const imageid = user.photo.id;

    //deleting photo to cloudinary
    const resp = await cloudinary.uploader.destroy(imageid);

    //updating poto to cloudinary
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  //updating the user new data
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModified: false,
  });
  res.status(200).json({
    success: true,
  });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  //getting all the users from DB
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  //gettig a updeted data from user
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //updating the user new data
  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModified: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No Such User Found", 401));
  }

  const imageid = user.photo.id;

  await cloudinary.uploader.destroy(imageid);

  await user.remove();

  res.status(200).json({
    success: true,
  });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  //getting only users
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});
