import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL)
    return console.log("mongodb database key not found");
  if (isConnected) return console.log("connected to database");

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Conncected to database");
  } catch (err) {
    console.log("ERROR->", err);
  }
};
