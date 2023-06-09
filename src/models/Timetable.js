const mongoose = require("mongoose");


const timetableSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  timetable: {
    type: [
      {
        day: {
          type: String,
          required: true
        },
        meals: [
          {
            date: {
              type: Date,
              required: true
            },
            category: {
              type: String,
              required: true
            },
            meal: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Meal',
              required: true
            }
          }
        ]
      }
    ],
    required: true
  }
});

module.exports = mongoose.model("Timetable", timetableSchema);

