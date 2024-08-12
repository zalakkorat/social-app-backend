const SocialPost = require("../models/socialPostModel");
const axios = require("axios");
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: "poojashiroya99@gmail.com", // Add your email to environment variables
        pass: process.env.EMAIL_PASS, // Add your email password to environment variables
      },
    });

    const mailOptions = {
      from: {
        name: "Pooja",
        address: "poojashiroya99@gmail.com",
      },
      to: email,
      subject: "Email Verification",
      text: "Please verify your email to proceed.",
      html: `<p>Please verify your email by clicking the link: <a href="http://localhost:3000/verify?email=${email}">Verify Email</a></p>`,
    };

    const sendMail = await transporter.sendMail(mailOptions);
    return sendMail;
  } catch (error) {
    console.log(error, "error");
  }
};

const createSocialPost = async (req, res) => {
  const { email, title, description, imgUrl, time, comments, likes } = req.body;

  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  try {
    const userExist = await axios.get(`http://localhost:3001/api/auth/${email}`).then(res => res.data);
    const postExist = await SocialPost.findOne({ email, title });

    if (userExist?.code === "userNotFound") {
      return res.status(200).json({ message: "User Not Found", code: "userNotFound" });
    }

    if (postExist) {
      return res.status(200).json({ message: "Please Provide different Title for Social Post", code: "socialPostExist" });
    }

    if (userExist?.code === "userExist" && !postExist) {
      // Send email verification link
      await sendEmail(email);

      return res.status(200).json({
        message: "Verification email sent. Please verify to proceed.",
        code: "verificationEmailSent"
      });
    }

  } catch (error) {
    console.log("error", error);
    return res.status(401).json({ message: "Invalid credentials", code: "error" });
  }
};

const verifyEmailAndCreatePost = async (req, res) => {
  const { email, title, description, imgUrl, time, comments, likes } = req.body;

  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  try {
    // This endpoint should be hit once the user verifies their email
    const userExist = await axios.get(`http://localhost:3001/api/auth/${email}`).then(res => res.data);
    const postExist = await SocialPost.findOne({ email, title });

    if (userExist?.code === "userNotFound") {
      return res.status(200).json({ message: "User Not Found", code: "userNotFound" });
    }

    if (postExist) {
      return res.status(200).json({ message: "Please Provide different Title for Social Post", code: "socialPostExist" });
    }

    if (userExist?.code === "userExist" && !postExist) {
     
      await SocialPost.create({
      title,
      description,
      email,
      imgUrl,
      comments,
      time,
      likes
    });

    return res.status(200).json({ message: "SocialPost created successfully", code: "socialPostCreated" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(401).json({ message: "Invalid credentials", code: "error" });
  }
};

module.exports = {
  createSocialPost,
  verifyEmailAndCreatePost,
  likePost,
  getPost,
  getPosts,
  addComment,
  deletePost,
};
