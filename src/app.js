const express = require("express");

const mongoose = require("mongoose");
require("dotenv/config");

const mealRouter = require("./routes/mealRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const timetableRouter = require("./routes/timetableRoute");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/meal", mealRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/timetable", timetableRouter);

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
  console.log(db.readyState, "Connected successfully");
});

//Start the server
app.listen(process.env.PORT || 3000);

module.exports = app;
