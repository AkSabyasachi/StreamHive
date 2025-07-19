import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


//* routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import communityRouter from "./routes/community.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";


const app = express(); // Creates the Express application instance

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      "http://localhost:5173", // Local development
      "https://stream-hive-gztm.vercel.app" // Your production frontend
    ];

    // Allow if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Block if not allowed
    const error = new Error(`CORS blocked: ${origin} not allowed`);
    error.status = 403;
    return callback(error, false);
  },
  credentials: true, // REQUIRED for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"] // Needed for cookies
}));

// 2. Body Parsing Middleware
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// 3. Static File Serving
app.use(express.static("public"));

// 4. Cookie Parser - MUST come before routes
app.use(cookieParser());

// 5. Debugging Middleware - Add this temporarily
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Cookies:', req.cookies);
  console.log('Authorization:', req.headers.authorization);
  next();
});



//* routes declaration
app.use("/api/v1/users", userRouter); 
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/community",communityRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/dashboard",dashboardRouter);


//* 404 handler
app.use("*",(req,res) => {
  res.status(404).json({
    success: false,
    message : "Route not found."
  })
})



export { app }; // Exports the configured Express app