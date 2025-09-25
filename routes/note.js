import express from "express";
import Note from "../models/Note.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import verifyMiddleWare from "./verifyMiddleWare.js";
const app = express();

const router = express.Router();

router.post("/add", verifyMiddleWare, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.body.id;
    const user = await User.findOne({ userId });
    const newNote = new Note({
      title: title,
      description: description,
      userId: req.user.id,
    });
    await newNote.save(); 
    return res.status(200).json({
      success: true,
      message: "Note Created Succefully",
      user: user,
    });
  } catch (err) {
    console.log(err.message);
  }
});
router.get("/", verifyMiddleWare, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id });
    return res.status(200).json({ success: true, notes });
  } catch (err) {
    return res.status(500).json({ succes: false, message: "can't get Notes" });
  }
});
router.put("/:id",verifyMiddleWare, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedNote = await Note.findByIdAndUpdate(id, {
      title,
      description,
    });
    return res.status(200).json({ success: true, updatedNote, user: req.user });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ succes: false, message: "can't update Notes" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedNote = await Note.findByIdAndDelete(id);
    return res.status(200).json({ success: true});
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ succes: false, message: "can't delete Notes" });
  }
});
export default router;
