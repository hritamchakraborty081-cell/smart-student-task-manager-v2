const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },

  examDate: {
    type: Date,
    required: true,
  },

  studyHours: {
    type: Number,
    required: true,
  },

 difficulty: {
  type: String,
  enum: ["Easy", "Medium", "Hard"],
  required: true,
},

completed: {
  type: Boolean,
  default: false,
},

createdAt: {
  type: Date,
  default: Date.now,
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Task", taskSchema);
