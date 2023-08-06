const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const convertToBase64 = require("../utils/convertToBase64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing parameters" });
    } else {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        const token = uid2(16);
        const salt = uid2(16);
        const saltedPassword = password + salt;

        const hash = SHA256(saltedPassword).toString(encBase64);

        const newUser = new User({
          email: email,
          account: {
            username: username,
          },
          newsletter: newsletter,
          token: token,
          hash: hash,
          salt: salt,
        });

        await newUser.save();

        const responseObject = {
          _id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
          },
        };
        return res.status(200).json(responseObject);
      } else {
        return res
          .status(409)
          .json({ message: "Cet email est déjà utilisé !" });
      }
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      const newHash = SHA256(req.body.password + foundUser.salt).toString(
        encBase64
      );
      if (newHash === foundUser.hash) {
        const responseObject = {
          _id: foundUser._id,
          token: foundUser.token,
          account: {
            username: foundUser.account.username,
          },
        };
        return res.status(200).json(responseObject);
      } else {
        return res.status(400).json({ message: "password or email incorrect" });
      }
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
