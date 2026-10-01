const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");

require("dotenv").config();

const Task = require("./models/task");

const app = express();
const PORT = process.env.PORT || 5000;

// Gemini API through OpenAI-compatible interface
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Smart Student Task Manager API is running!",
  });
});

// ===============================
// Save Student Study Information
// ===============================

app.post("/api/study-plan", async (req, res) => {
  try {
    const {
      subject,
      examDate,
      studyHours,
      difficulty,
    } = req.body;

    const newTask = new Task({
      subject,
      examDate,
      studyHours,
      difficulty,
    });

    const savedTask = await newTask.save();

    console.log("SAVED TASK:", savedTask);

    res.status(201).json({
      message: "Study information saved successfully!",
      data: savedTask,
    });
  } catch (error) {
    console.error("Error saving task:", error);

    res.status(500).json({
      message: "Failed to save study information",
    });
  }
});

// ===============================
// Get All Saved Tasks
// ===============================

app.get("/api/study-plan", async (req, res) => {
  try {
    const tasks = await Task.find().sort({
      createdAt: -1,
    });

    res.json({
      message: "Tasks fetched successfully!",
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

// ===============================
// Mark Task as Completed
// ===============================

app.put("/api/study-plan/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { returnDocument: "after" }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task completed successfully!",
      data: task,
    });
  } catch (error) {
    console.error("Error completing task:", error);

    res.status(500).json({
      message: "Failed to complete task",
    });
  }
});

// ===============================
// Delete Task
// ===============================

app.delete("/api/study-plan/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully!",
      data: deletedTask,
    });
  } catch (error) {
    console.error("Error deleting task:", error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

// ===============================
// Generate AI Study Plan Using Gemini
// ===============================

app.post("/api/ai/study-plan", async (req, res) => {
  try {
    const { tasks } = req.body;

    // Check if tasks exist
    if (!tasks || tasks.length === 0) {
      return res.status(400).json({
        message: "No study tasks provided",
      });
    }

    // Convert tasks into readable information
    const taskInformation = tasks
      .map(
        (task) =>
          `Subject: ${task.subject}, Exam Date: ${task.examDate}, Study Hours: ${task.studyHours}, Difficulty: ${task.difficulty}, Completed: ${task.completed}`
      )
      .join("\n");

    // Send request to Gemini
    const response = await openai.chat.completions.create({
     model: "gemini-3.5-flash-lite",

      messages: [
        {
          role: "system",
          content:
            "You are a helpful college study planner. Create practical, realistic study plans for college students.",
        },

        {
          role: "user",
          content: `Create a practical study plan based on these tasks:

${taskInformation}

Rules:

- Prioritize exams that are closer.
- Give more attention to difficult subjects.
- Respect the available study hours.
- Do not schedule completed tasks.
- Keep the plan realistic.
- Give a clear day-by-day plan.
- Keep the response concise and easy for a college student to follow.
- Use simple language.
- Include the subject name and recommended study hours for each day.`,
        },
      ],
    });

    // Get Gemini's response
    const plan = response.choices[0].message.content;

    // Send plan to frontend
    res.json({
      message: "AI study plan generated successfully!",
      plan: plan,
    });
  } catch (error) {
    console.error("Gemini AI study plan error:", error);

    res.status(500).json({
      message: "Failed to generate AI study plan",
    });
  }
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
