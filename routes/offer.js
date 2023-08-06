const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");
const User = require("../models/User");

router.post("/offers", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
    });
    newOffer.owner = req.user;

    const convertedFile = convertToBase64(req.files.picture);
    const uploadResponse = await cloudinary.uploader.upload(convertedFile, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    newOffer.product_image = uploadResponse;

    await newOffer.save();

    return res.status(201).json(newOffer);
  } catch (error) {
    res.status(400).json({ message: message.error });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const limit = 5;
    let page = 1;

    if (req.query.page) {
      page = req.query.page;
    }

    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = { $lte: req.query.priceMax };
      }
    }

    const sortObject = {};

    if (req.query.sort === "price-asc") {
      sortObject.product_price = "asc";
    } else if (req.query.sort === "price-desc") {
      sortObject.product_price = "desc";
    }

    const offers = await Offer.find(filters)
      .sort(sortObject)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("product_name product_price -_id");

    return res.status(200).json(offers);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
