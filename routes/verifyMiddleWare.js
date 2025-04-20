import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const verifyMiddleWare = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; 

    if (token == null || !token) {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded == null || !decoded) {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findById({ _id: decoded.id });
    if (user == null || !user) {
      res.status(404).json({ success: false, message: "No user found" }); 
    }
    const existingUser = { name: user.name, id: user._id };
    req.user = existingUser;
    next();
  } catch (err) {
    res.json({ success: false, message: "there was an error: " + err });
  }
}; 

export default verifyMiddleWare; 