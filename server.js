// Express.js is a web framework for Node.js used to build backend servers and APIs easily
import express from "express";

//dotenv is a library used in Node.js to load environment variables from a .env file.
import dotenv from "dotenv"

//Cross-Origin Resource Sharing (CORS): frontend application can access backend APIs from a different origin.
//CORS is like company permission that allows outsiders to access some information.
// Different port != cannot connect
// Different port = need CORS permission
import cors from "cors";

// import routes
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"
import communityRoutes from "./routes/communityRoutes.js"

//imports the connectDb function from the db.js file so we can use it in this file.
import connectDb from "./config/db.js";

//use cookie-parser in Express.js to read cookies sent by the browser
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

//dotenv reads the .env file and puts those variables into process.env
dotenv.config(); 

//create an Express server application or create instance
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//allow frontend applications from other origins (different ports/domains) to access the backend API.
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://hilarious-sunshine-23077e.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

//Whenever a request comes from the browser, read the cookies and convert them into an object.
app.use(cookieParser());

// converts JSON data from the request body into a JavaScript object.
app.use(express.json());


//port from .env
const PORT = process.env.PORT || 5000;

//MongoDB connection must happen once when the server starts, not inside
//database URL from .env
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/community";

// connect to MongoDB
//connectDB is function name used to connect the database.(inside config - db.js)
connectDb(MONGO_URI);

//Middleware or route
//Middleware is a function that runs between the client request and the server response
//app.use() is used to mount middleware or routers onto the Express application

// Application middleware
//tells Express to use the routes inside userRoutes whenever a request starts with /api/user.
//base path
app.use(
  "/uploads",
  express.static(path.join(__dirname, "profile_pictures"))
);
app.use("/api/user",userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/community", communityRoutes);
//starts the Express server and it listen requests on the specified port.


app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


app.listen(PORT, () => {
  console.log("Server is listening to PORT:", PORT);
});

// app.use(express.static(path.join(_dirname,"/community-frontend/dist")))
// app.get('*', (_,res) => { 
//   res.sendFile(path.resolve(_dirname, "community-frontend", "dist", "index.html"));
// });

// app.use((req,res) => {
//   res.json({message: "Route is not found"});
// })
// const path = require("path");
// import path from "path";//
//  "scripts": {
//     "dev": "nodemon community-backend/server.js",
//     "build":"npm install && npm install --prefix community-frontend && npm run build  --prefix community-frontend",
//     "start": "nodemon community-backend/server.js"
//   },
//const _dirname = path.resolve();