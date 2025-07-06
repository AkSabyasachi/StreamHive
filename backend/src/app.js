import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


//* routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js"


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



//* routes declaration
app.use("/api/v1/users", userRouter); 
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);


//* 404 handler
app.use("*",(req,res) => {
  res.status(404).json({
    success: false,
    message : "Route not found."
  })
})



export { app }; // Exports the configured Express app