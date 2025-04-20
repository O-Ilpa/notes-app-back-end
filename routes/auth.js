import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import verifyMiddleWare from "./verifyMiddleWare.js";

const router = express.Router();

const sendCodeToEmail = (code, email) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "omarilpa09@gmail.com",
      pass: "fdecormslqjlysws",
    },
  });

  var mailOptions = {
    from: "omarilpa09@gmail.com",
    to: email,
    subject: "Verification Code for Note App",
    text: "Enter the Code Below to Verify you Email \n " + code,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
const generateOTPCode = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const code = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });
  return code;
};
const verifyOTP = (usersCode, newUser) => {
  if (newUser.codeDigit != null)
    return newUser.codeDigit.toString().trim() === usersCode.trim();
};
router.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User Already Exists" });
    }
    const newUser = new User({
      name: name,
      email: email,
      verified: false,
      codeDigit: generateOTPCode(),
    });
    await newUser.save();
    sendCodeToEmail(newUser.codeDigit, newUser.email);
    return res
      .status(200)
      .json({ success: true, message: "User Created Succefully" });
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User doesn't Exist", success: false });
    }
    const passIsTrue = await bcrypt.compare(password, user.password);

    if (passIsTrue) {
      const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
      return res.json({
        success: true,
        message: "User Loged in Succefully",
        user: user.name,
        token: token,
      });
    } else {
      res.json({ success: false, message: "Wrong credentials" });
    }
  } catch (err) {
    res.json({ success: false, message: err.name });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const usersCode = req.body.code;
    const email = req.body.newEmail;
    const newUser = await User.findOne({ email: email });
    if (newUser != null) {
      if (verifyOTP(usersCode, newUser)) {
        newUser.verified = true;
        newUser.codeDigit = null;
        await newUser.save();
        return res
          .status(200)
          .json({ success: true, message: "User Added Succefully" });
      } else {
        return res.json({ success: false, message: "Wrong Code" });
      }
    }
  } catch (err) {
    return res.json({ success: false, message: err.name });
  }
});

router.post("/pass", async (req, res) => {
  try {
    const password = req.body.password;
    const reEnteredPassword = req.body.rePassword;
    const email = req.body.newEmail;
    if (password.trim() === reEnteredPassword.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.findOne({ email });
      user.password = hashedPassword;
      await user.save();
      return res.json({ success: true, message: "User Created Succefully" });
    } else {
      return res.json({
        success: false,
        message: "Your passwords must be the same ",
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: err.name,
    });
  }
});
router.get("/verification", verifyMiddleWare, async (req, res) => {
  return res.status(200).json({success: true, user: req.user})
})
setTimeout(async () => {
  const unVerifiedUsers = await User.find({ verified: false });
  unVerifiedUsers.forEach(async (user) => {
    await user.deleteOne();
  });
}, 5 * 60 * 1000);
export default router;
