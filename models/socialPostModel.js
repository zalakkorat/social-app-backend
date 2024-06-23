const mongoose = require("mongoose");

const socialPostSchema = new mongoose.Schema({
    email: String,
    title: String,
    description: String,
    imgUrl: String,
    time: Date,
    comments: [{ type: { comment: String, commentBy: String } }],
    likes: [{ type: Number }]
});

module.exports = mongoose.model("SocialPost", socialPostSchema);
