import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express from "express";
import cors from "cors";
import registerRouter from "./routes/auth.js";
import mongoose from "mongoose";
import noteRouter from "./routes/note.js"

const app = express();

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use("/api/auth", registerRouter);
app.use("/api/note", noteRouter);

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection; 
db.on("error", (error) => console.error(error.name));
db.once("open", () => console.log("connected to mongoose"));

app.listen(process.env.PORT || 5000);
