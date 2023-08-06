require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer.js");
app.use(offerRoutes);

app.all("*", (req, res) => {
  return res.status(404).json("Cette route n'existe pas");
});

app.listen(process.env.PORT, () => {
  console.log("Serveur vinted Online");
});
