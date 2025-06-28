// This is the main entry point of the application

// require("dotenv").config({path: "./.env"});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";
 
dotenv.config({ 
  path: "./.env" 
});

connectDB() //Returns a promise so .then() can be used to handle the connection result
 .then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
  })
 })
 .catch((error) => {
  console.log("MongoDB connection failed !!",error)
 })

















/*
1st approach for connecting to MongoDB
 Importing required modules

import express from "express"
const app = express() 
-------Immediate execution function-IIFE--------
------- Connect to MongoDB---------
( async () => {
  try
  {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error) => {
      console.log("ERROR: ",error)
      throw error
    })

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port: ${process.env.PORT}`)
    })

  }
  catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error
  }
})()
  */