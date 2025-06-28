import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); // Creates the Express application instance

// 1. CORS Configuration (Cross-Origin Resource Sharing)
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Restricts API access to specified frontend URL
  credentials: true, // Allows cookies/authorization headers in cross-origin requests
}));
// 2. Body Parsing Middleware
app.use(express.json({ limit: "50kb" })); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true, limit: "50kb" })); // Parses URL-encoded forms
// 3. Static File Serving
app.use(express.static("public")); // Serves files from the 'public' directory
// 4. Cookie Parser
app.use(cookieParser()); // Parses cookies into req.cookies object


//routes import
import userRouter from "./routes/user.routes.js";


//routes declaration
app.use("/api/v1/users", userRouter); 





export { app }; // Exports the configured Express app