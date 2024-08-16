const SocialPost = require("../models/socialPostModel");
const axios = require("axios");
const nodemailer = require("nodemailer");

const sendEmail = async (email, post) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: "ruchikaarora248@gmail.com", // Add your email to environment variables
        pass: "hlcrsqchhiewfmvr", // Add your email password to environment variables
      },
    });
    const encodedEmail = encodeURIComponent(email)
    const title = encodeURIComponent(post.title);
    const description = encodeURIComponent(post.description);
    const imgUrl = encodeURIComponent(post.imgUrl);

    const mailOptions = {
      from: {
        name: "Ruchika",
        address: "ruchikaarora248@gmail.com",
      },
      to:"ruchikaarora248@gmail.com",
      subject: "Email Verification",
      html: `<h3>Hi Admin, you have receievd a request. Could you please verify the post and approve?</h3><p>Please verify ${email}'s post by clicking the link: <a href="https://acsprojectteam3.netlify.app/verify?email=${encodedEmail}&title=${title}&description=${description}&img=${imgUrl}">Verify Email</a></p>`,
    };

    const sendMail = await transporter.sendMail(mailOptions);
    return sendMail;
  } catch (error) {
    console.log(error, "error");
    return res.status(500).json({ message: "Internal Server Error", code: "error" });
  }
};

const createSocialPost = async (req, res) => {
  const { email, title, description, imgUrl, time, comments, likes } = req.body;
  const post = { email, title, description, imgUrl, time, comments, likes };
  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });

    if (userExist?.code === "userNotFound") {
      return res
        .status(400)
        .json({ message: "User Not Found", code: "userNotFound" });
    }

    if (postExist) {
      return res
        .status(400)
        .json({
          message: "Please Provide different Title for Social Post",
          code: "socialPostExist",
        });
    }

    if (userExist?.code === "userExist" && !postExist) {
      // Send email verification link
      await sendEmail(email, post);

      return res.status(200).json({
        message: "Verification email sent. Please verify to proceed.",
        code: "verificationEmailSent",
      });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const verifyEmailAndCreatePost = async (req, res) => {
  const { email, title, description, imgUrl, time, comments, likes } = req.body;

  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    // This endpoint should be hit once the user verifies their email
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });

    if (userExist?.code === "userNotFound") {
      return res
        .status(400)
        .json({ message: "User Not Found", code: "userNotFound" });
    }

    if (postExist) {
      return res
        .status(400)
        .json({
          message: "Please Provide different Title for Social Post",
          code: "socialPostExist",
        });
    }

    if (userExist?.code === "userExist" && !postExist) {
      await SocialPost.create({
        title,
        description,
        email,
        imgUrl,
        comments,
        time,
        likes,
      });

      return res
        .status(200)
        .json({
          message: "SocialPost created successfully",
          code: "socialPostCreated",
        });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const likePost = async (req, res) => {
  const { email, title, like, likeBy } = req.body;
  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app"); // replace 'https://acsprojectteam3.netlify.app' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(400)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(400)
        .json({ message: "Social Post Not Found", code: "socialPostNotExist" });
    } else if (postExist) {
      let data = postExist.likes.length && [...postExist.likes];
      let checkEmail = false;
      data &&
        data.forEach((item) => {
          if (item.likeBy === likeBy) checkEmail = true;
        });

      if (!checkEmail && data) {
        data = [...data, { like, likeBy }];
      }
      if (!checkEmail && !data) data = [{ like, likeBy }];
      else {
        data = data.map((item) => {
          if (item.likeBy === likeBy) return { like, likeBy };
          else return item;
        });
      }
      await SocialPost.findOneAndUpdate({ email, title }, { likes: data });
      return res
        .status(200)
        .json({
          message: "Social Post Liked",
          code: "socialPostLiked",
          likes: data,
        });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal Server Error", code: "error" });
  }
};

const getPost = async (req, res) => {
  const title = req.params.id;
  const { email } = req.body;
  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app"); // replace 'https://acsprojectteam3.netlify.app' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(400)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(400)
        .json({ message: "Social Post Not Found", code: "socialPostNotFound" });
    } else if (postExist) {
      return res.status(200).json({
        message: "Social post exist",
        code: "socialPostExist",
        socialPost: postExist,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const getPosts = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app"); // replace 'https://acsprojectteam3.netlify.app' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const postExist = await SocialPost.find();
    if (!postExist) {
      return res
        .status(400)
        .json({ message: "Social Post Not Found", code: "socialPostNotFound" });
    } else if (postExist) {
      return res.status(200).json({
        message: "Social posts exist",
        code: "socialPostsExist",
        socialPosts: postExist,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const addComment = async (req, res) => {
  const { email, title, comment, commentedBy } = req.body;
  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app"); // replace 'https://acsprojectteam3.netlify.app' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(400)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(400)
        .json({ message: "Social Post Not Found", code: "socialPostNotExist" });
    } else if (postExist) {
      const comments = [...postExist.comments, { comment, commentedBy }];
      await SocialPost.findOneAndUpdate({ email, title }, { comments });
      return res.status(200).json({
        message: "Social Post commented",
        code: "socialPostCommented",
        comments,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal Server Error", code: "error" });
  }
};

const deletePost = async (req, res) => {
  const { email, title } = req.body;
  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app"); // replace 'https://acsprojectteam3.netlify.app' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(400)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(400)
        .json({ message: "Social Post Not Found", code: "socialPostNotExist" });
    } else if (postExist) {

      await SocialPost.findOneAndDelete({ email, title });
      return res.status(200).json({
        message: "Social Post deleted",
        code: "socialPostDeleted",
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal Server Error", code: "error" });
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
