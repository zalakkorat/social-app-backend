// server.js
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

const corsOptions = {
  origin: "https://orders-frontend.netlify.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (cookies, HTTP authentication) to be included
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://gzpxjh.csb.app"); // Replace 'https://orders-frontend.netlify.app' with the specific origin you want to allow
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("");
  next();
});

mongoose
  .connect(
    "mongodb+srv://zalakkorat:gxdkspvKTIcHpvp5@cluster0.nwhks7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  )
  .then(() => console.log("connected"))
  .catch((error) => console.log(error));

const authRoutes = require("../routes/authRoutes");
app.use("/api/auth", authRoutes);

const socialPostRoutes = require("../routes/socialPostRoutes");
app.use("/api/socialPost", socialPostRoutes);


app.get("/", (req, res) => {
  console.log("correct");
  res.status(200).json({ message: "successful login", code: "loggedIn" });
});

function authenticateToken(token) {
  let authorize = true;
  jwt.verify(token, "login", (err, user) => {
    if (err) {
      authorize = false;
    }
  });
  return authorize;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use('/.netlify/functions/api', app.router());
module.exports.handler = serverless(app);