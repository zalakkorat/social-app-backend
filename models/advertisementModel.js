const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({
    email: String,
    title: String,
    description: String,
    imgUrl: String,
    time: Date,
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
