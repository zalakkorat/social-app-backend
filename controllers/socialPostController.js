const SocialPost = require("../models/socialPostModel");
const axios = require("axios");

const createSocialPost = async (req, res) => {
  const { email, title, description, imgUrl, time, comments, likes } = req.body;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    }
    if (postExist) {
      return res.status(200).json({
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
      return res.status(200).json({
        message: "SocialPost created successfully",
        code: "socialPostCreated",
      });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const likePost = async (req, res) => {
  const { email, title } = req.body;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(200)
        .json({ message: "Social Post Not Found", code: "socialPostNotExist" });
    } else if (postExist) {
      await SocialPost.findOneAndUpdate(
        { email, title },
        { likes: Number(postExist.likes) + 1 },
      );
      return res.status(200).json({
        message: "Social Post Liked",
        code: "socialPostExist",
        likes: Number(postExist.likes) + 1,
      });
    }
  } catch (error) {
    console.log("error", error);
  }
};

const getPost = async (req, res) => {
  const title = req.params.id;
  const { email } = req.body;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(200)
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
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const getPosts = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const postExist = await SocialPost.find();
    if (!postExist) {
      return res
        .status(200)
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
      .status(401)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

const addComment = async (req, res) => {
  const { email, title, comment, commentedBy } = req.body;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(200)
        .json({ message: "Social Post Not Found", code: "socialPostNotExist" });
    } else if (postExist) {
      const comments = [...postExist.comments, { comment, commentedBy }];
      await SocialPost.findOneAndUpdate({ email, title }, { comments });
      return res.status(200).json({
        message: "Social Post commented",
        code: "socialPostExist",
        comments,
      });
    }
  } catch (error) {
    console.log("error", error);
  }
};

const deletePost = async (req, res) => {
  const { email, title } = req.body;
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // replace 'http://localhost:3000' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const postExist = await SocialPost.findOne({ email, title });
    if (userExist?.code === "userNotFound") {
      return res
        .status(200)
        .json({ message: "User Not Found", code: "userNotFound" });
    } else if (!postExist) {
      return res
        .status(200)
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
  }
};

module.exports = {
  createSocialPost,
  likePost,
  getPost,
  getPosts,
  addComment,
  deletePost,
};
