const Advertisement = require("../models/advertisementModel");
const axios = require("axios");

const createAdvertisement = async (req, res) => {
  const { email, title, description, imgUrl } = req.body;

  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const userExist = await axios
      .get(`http://localhost:3001/api/auth/${email}`)
      .then((res) => res.data);
    const advertisement = await Advertisement.findOne({ email, title });

    if (userExist?.code === "userNotFound") {
      return res
        .status(400)
        .json({ message: "User Not Found", code: "userNotFound" });
    }
    if (advertisement) {
      return res.status(400).json({
        message: "Please Provide different Title for Advertisement",
        code: "advertisementExist",
      });
    }
    if (userExist?.code === "userExist" && !advertisement) {
      await Advertisement.create({
        email,
        title,
        description,
        imgUrl,
      });
      return res.status(200).json({
        message: "Advertisement created successfully",
        code: "advertisementCreated",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", code: "error" });  
  }
};

const getAdvertisements = async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://acsprojectteam3.netlify.app"); // replace 'https://acsprojectteam3.netlify.app' with your frontend's URL in production
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const advertisements = await Advertisement.find();
    if (!advertisements) {
      return res
        .status(400)
        .json({
          message: "Advertisements Not Found",
          code: "advertisementNotFound",
        });
    } else if (advertisements) {
      return res.status(200).json({
        message: "Advertisements exist",
        code: "advertisementsExist",
        advertisements: advertisements,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "Invalid credentials", code: "error" });
  }
};

module.exports = {
  getAdvertisements,
  createAdvertisement,
};
