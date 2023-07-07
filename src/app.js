const express = require("express");
const cors = require('cor');

const mongoose = require("mongoose");
require("dotenv/config");

const mealRouter = require("./routes/mealRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const timetableRouter = require("./routes/timetableRoute");
const subscriptionRouter = require("./routes/subscriptionRoute");
const storeRouter = require("./routes/storeRoute");
const SchedulerService = require("./services/schedulerService");

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/meal", mealRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/timetable", timetableRouter);
app.use("/subscription", subscriptionRouter);
app.use("/store", storeRouter);

app.use(cors({
  origin: "https://mealbleapi-58d2.onrender.com"
}
))
app.options('*', cors())

app.use("/", (req, res) => {
  res.send("Welcome to the Mealble");
});



//Connect to DB
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("DB Connected successfully", db.readyState);
});

//Start Scheduler
scheduler = new SchedulerService();

//Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port", process.env.PORT);

  // Define and start the scheduler within the callback function
  scheduler.startScheduler();
});

module.exports = app;
