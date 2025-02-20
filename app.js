const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const globalErrorHandler = require("./middleware/globalErrorHandler");

// adding different security features
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config();

const app = express();

app.use(helmet());

app.use(mongoSanitize());

app.use(cors());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// to parse incoming requests data to JSON
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.use("/", (req, res) => {
  res.send("Welcome to the API");
});

// Catch all for unhandled routes
app.all("*", (req, res, next) => {
  const AppError = require("./utils/appError");
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
