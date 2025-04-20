import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
  },
  codeDigit: {
    type: Number,
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
