// Express.js is a web framework for Node.js used to build backend servers and APIs easily
import express from "express";

// dotenv is a library used in Node.js to load environment variables from a .env file.
import dotenv from "dotenv";

// Cross-Origin Resource Sharing (CORS): frontend application can access backend APIs from a different origin.
// CORS is like company permission that allows outsiders to access some information.
// Different port != cannot connect
// Different port = need CORS permission
import cors from "cors";

// import routes
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";

// imports the connectDb function from the db.js file so we can use it in this file.
import connectDb from "./config/db.js";

// use cookie-parser in Express.js to read cookies sent by the browser
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// dotenv reads the .env file and puts those variables into process.env
dotenv.config();

// create an Express server application or create instance
const app = express();

// Fix __dirname (because ES modules do not support it directly)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================= CORS CONFIG =======================
// allow frontend applications from other origins (different ports/domains) to access the backend API.

const allowedOrigins = [
  "http://localhost:5173", // Local Vite dev server
  "https://hilarious-sunshine-23077e.netlify.app", // Deployed frontend (Netlify)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman / mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    credentials: true,
  })
);
app.options("*", cors());
// ==========================================================

// Whenever a request comes from the browser, read the cookies and convert them into an object.
app.use(cookieParser());

// converts JSON data from the request body into a JavaScript object.
app.use(express.json());

// port from .env
const PORT = process.env.PORT || 5000;

// MongoDB connection must happen once when the server starts, not inside routes
// database URL from .env (DO NOT fallback to local in production)
const MONGO_URI = process.env.MONGO_URI;

// connect to MongoDB
// connectDb is function name used to connect the database (inside config/db.js)
connectDb(MONGO_URI);

// ======================= MIDDLEWARE =======================
// Middleware is a function that runs between the client request and the server response
// app.use() is used to mount middleware or routers onto the Express application

// serve static files (profile pictures)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "profile_pictures"))
);

// routes
// tells Express to use the routes inside userRoutes whenever a request starts with /api/user.
app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/community", communityRoutes);

// ==========================================================

// test route
app.get("/", (req, res) => {
  res.send("Backend is running ");
});

// starts the Express server and listens for requests on the specified port
app.listen(PORT, () => {
  console.log("Server is listening to PORT:", PORT);
});