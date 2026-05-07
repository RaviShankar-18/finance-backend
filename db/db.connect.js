const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI;

const initializeDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to database successfully.");
  } catch (error) {
    console.log("Error occurred while connecting to database.", error);
  }
};

module.exports = { initializeDatabase };
