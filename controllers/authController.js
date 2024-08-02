const User = require("../models/userModel");
const CryptoJS = require("crypto-js");

const login = async (req, res) => {
  const { email, password } = req.body;
  const bytes = CryptoJS.AES.decrypt(password, "login");
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  res.header(
    "Access-Control-Allow-Origin",
    "http://localhost:3000",
  ); 
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      const userBytes = CryptoJS.AES.decrypt(userExist.password, "register");
      const originalPassword = userBytes.toString(CryptoJS.enc.Utf8);

      if (originalPassword === originalText) {
        await User.findOneAndUpdate({ email }, { isLoggedIn: true });
        return res.status(200).json({
          message: "successful login",
          code: "loggedIn",
          user: userExist,
        });
      } else {
        return res
          .status(200)
          .json({ message: "Incorrect Password", code: "incorrectPassword" });
      }
    } else {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const register = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(200)
        .json({ message: "User already exist", code: "existUser" });
    } else {
      await User.create({
        firstName,
        lastName,
        email,
        password,
        isLoggedIn: false,
        phoneNumber,
      });
      return res
        .status(200)
        .json({ message: "User registered successfully", code: "registered" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Internal Error", code: "error" });
  }
};

const logout = async (req, res) => {
  const { email } = req.body;

  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await User.findOne({ email });
    if (userExist && userExist.isLoggedIn) {
      await User.findOneAndUpdate({ email }, { isLoggedIn: false });
      return res.status(200).json({ message: "Logged out", code: "logout" });
    }
    if (!userExist) {
      return res
        .status(200)
        .json({ message: "user not found", code: "userNotFound" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Internal Error", code: "error" });
  }
};

const forgetPwd = async (req, res) => {
  const { email, newPassword } = req.body;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      // Decrypt
      const bytes = CryptoJS.AES.decrypt(newPassword, "forgetPassword");
      const originalText = bytes.toString(CryptoJS.enc.Utf8);

      //encrypt
      const newPwd = CryptoJS.AES.encrypt(originalText, "register").toString();

      await User.findOneAndUpdate({ email }, { password: newPwd });
      return res
        .status(200)
        .json({ message: "Password Updated", code: "forgetPwdSuccess" });
    } else {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      // Decrypt
      const bytes = CryptoJS.AES.decrypt(oldPassword, "resetPassword");
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      // decrypt new password
      const newBytes = CryptoJS.AES.decrypt(newPassword, "resetPassword");
      const newOriginalText = newBytes.toString(CryptoJS.enc.Utf8);
      // decrypt user password
      const userBytes = CryptoJS.AES.decrypt(userExist.password, "register");
      const userOriginalText = userBytes.toString(CryptoJS.enc.Utf8);

      //encrypt new password
      const newPasswordText = CryptoJS.AES.encrypt(
        newOriginalText,
        "register",
      ).toString();

      if (userOriginalText === originalText) {
        await User.findOneAndUpdate({ email }, { password: newPasswordText });
        return res
          .status(200)
          .json({ message: "Password Updated.", code: "PasswordUpdate" });
      }
      if (userOriginalText !== originalText) {
        return res.status(200).json({
          message: "Old Password Not Match",
          code: "oldPasswordNotMatch",
        });
      }
    } else {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const getUser = async (req, res) => {
  const email = req.params.email;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(200)
        .json({ message: "User Found", code: "userExist", user: userExist });
    } else {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const updateUser = async (req, res) => {
  const { email, userDetails } = req.body;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      await User.findOneAndUpdate({ email }, userDetails);
      return res.status(200).json({
        message: "User Updated",
        code: "userUpdate",
      });
    } else {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

module.exports = {
  login,
  register,
  logout,
  forgetPwd,
  resetPassword,
  getUser,
  updateUser,
};
