import { useEffect, useState } from "react";
import StudentInputForm from "./components/StudentInputForm";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);

  const [aiPlan, setAiPlan] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Load tasks from MongoDB
  useEffect(() => {
    fetch("http://localhost:5000/api/study-plan")
      .then((response) => response.json())
      .then((result) => {
        setTasks(result.data);
      })
      .catch((error) => {
        console.error("Error loading tasks:", error);
      });
  }, []);

  // Add new task
  const handleFormSubmit = (data) => {
    setTasks((previousTasks) => [data, ...previousTasks]);
  };

  // Calculate task priority
  const calculatePriority = (task) => {
    if (task.completed) {
      return "Completed";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exam = new Date(task.examDate);
    exam.setHours(0, 0, 0, 0);

    const difference = exam - today;

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );


    let score = 0;

    // Exam deadline
    if (daysLeft <= 2) {
      score += 4;
    } else if (daysLeft <= 5) {
      score += 3;
    } else if (daysLeft <= 10) {
      score += 2;
    } else {
      score += 1;
    }

    // Difficulty
    if (task.difficulty === "Hard") {
      score += 3;
    } else if (task.difficulty === "Medium") {
      score += 2;
    } else {
      score += 1;
    }

    // Study hours
    if (task.studyHours >= 5) {
      score += 3;
    } else if (task.studyHours >= 3) {
      score += 2;
    } else {
      score += 1;
    }

    if (score >= 7) {
      return "High";
    }

    if (score >= 5) {
      return "Medium";
    }

    return "Low";
  };
  const getDaysLeft = (examDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);

  const difference = exam - today;

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};

  // Complete task
  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/study-plan/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task._id === taskId ? result.data : task
          )
        );
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/study-plan/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setTasks((previousTasks) =>
          previousTasks.filter((task) => task._id !== taskId)
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Generate AI study plan
  const generateAIPlan = async () => {
    if (tasks.length === 0) {
      alert("Please add at least one study task first.");
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tasks,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setAiPlan(result.plan);
    } catch (error) {
      console.error("AI plan error:", error);
      alert("Could not generate the AI study plan.");
    } finally {
      setAiLoading(false);
    }
  };

  // Progress calculations
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // High priority tasks
  const highPriorityTasks = tasks.filter(
    (task) => calculatePriority(task) === "High"
  );
  const totalStudyHours = tasks.reduce(
  (total, task) => total + Number(task.studyHours),
  0
);

const pendingTasks = tasks.filter(
  (task) => !task.completed
).length;

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
  <div className="navbar">
    <div className="logo">
      📚 Smart Student
    </div>

    <nav className="nav-links">
      <a href="#dashboard">Dashboard</a>
      <a href="#tasks">My Tasks</a>
      <a href="#ai-planner">AI Planner</a>
    </nav>
  </div>

  <div className="hero">
    <h1>Smart Student Task Manager</h1>
    <p>
      Organize your studies. Prioritize your workload. Stay ahead of deadlines.
    </p>
  </div>
</header>

      <main className="container" id="dashboard">
        <section className="stats-section">

  <div className="stat-card">
    <div className="stat-icon">📚</div>
    <div>
      <span>Total Tasks</span>
      <strong>{totalTasks}</strong>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon">🔥</div>
    <div>
      <span>High Priority</span>
      <strong>{highPriorityTasks.length}</strong>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon">⏱️</div>
    <div>
      <span>Study Hours</span>
      <strong>{totalStudyHours}</strong>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon">⏳</div>
    <div>
      <span>Pending</span>
      <strong>{pendingTasks}</strong>
    </div>
  </div>

</section>

        {/* Progress */}
        <section className="progress-section">

          <div className="progress-header">

            <div>
              <h2>📊 Your Progress</h2>

              <p>
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>

            <div className="progress-percentage">
              {completionPercentage}%
            </div>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${completionPercentage}%`,
              }}
            ></div>

          </div>

        </section>

        {/* Add Task */}
        <section className="form-section">

          <h2>Add Study Task</h2>

          <StudentInputForm
            onSubmit={handleFormSubmit}
          />

        </section>

        {/* AI Study Planner */}
      <section className="ai-section" id="ai-planner">

          <div className="ai-header">

            <div>

              <h2>🤖 AI Study Planner</h2>

              <p>
                Let AI create a personalized study
                plan based on your tasks.
              </p>

            </div>

            <button
              className="ai-button"
              onClick={generateAIPlan}
              disabled={
                aiLoading || tasks.length === 0
              }
            >
              {aiLoading
                ? "Creating Plan..."
                : "Generate AI Plan ✨"}
            </button>

          </div>

          {aiPlan && (
  <div className="ai-result">
    <div className="ai-result-header">
      <div>
        <span className="ai-label">AI GENERATED</span>
        <h3>📚 Your Personalized Study Plan</h3>
      </div>

      <span className="ai-status">✨ Ready</span>
    </div>

    <div className="ai-plan-text">
      {aiPlan
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line, index) => (
          <div className="plan-line" key={index}>
            {line}
          </div>
        ))}
    </div>
  </div>
)}

        </section>

        {/* Today's Focus */}
        <section className="focus-section">

          <h2>🎯 Today's Focus</h2>

          {highPriorityTasks.length === 0 ? (

            <p>
              No high-priority tasks right now.
              You're doing great! 🎉
            </p>

          ) : (

            <ul>

              {highPriorityTasks.map((task) => (

                <li key={task._id}>

                  <strong>
                    {task.subject}
                  </strong>

                  {" — "}

                  {task.studyHours} hours of study

                </li>

              ))}

            </ul>

          )}

        </section>

        {/* Tasks */}
        <section className="tasks-section" id="tasks">

          <div className="section-heading">

            <h2>📚 My Study Tasks</h2>

            <span>
              {tasks.length} task(s)
            </span>

          </div>

          {tasks.length === 0 ? (

            <div className="empty-state">

              <p>
                📖 No study tasks added yet.
              </p>

              <p>
                Add your first task above!
              </p>

            </div>

          ) : (
<div className="task-grid">
  {[...tasks]
    .sort((a, b) => {
      const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3,
        Completed: 4,
      };

      return (
        priorityOrder[calculatePriority(a)] -
        priorityOrder[calculatePriority(b)]
      );
    })
    .map((task) => {
      const priority = calculatePriority(task);

      return (
        <div
          className={`task-card ${
            task.completed ? "completed" : ""
          }`}
          key={task._id}
        >

                    {/* Task header */}
                    <div className="task-header">

                      <h3>
                        {task.subject}
                      </h3>

                      <span
                        className={`difficulty ${task.difficulty.toLowerCase()}`}
                      >
                        {task.difficulty}
                      </span>

                    </div>

                    {/* Priority */}
                    <div
                      className={`priority-badge ${priority.toLowerCase()}`}
                    >
                      Priority: {priority}
                    </div>

                    {/* Exam */}
                  <p>
  📅 <strong>Exam:</strong>{" "}
  {new Date(task.examDate).toLocaleDateString()}
</p>

{!task.completed && (
  <p
    className={`days-left ${
      getDaysLeft(task.examDate) <= 2
        ? "urgent"
        : getDaysLeft(task.examDate) <= 5
        ? "soon"
        : "normal"
    }`}
  >
    ⏳{" "}
    <strong>
      {getDaysLeft(task.examDate) < 0
        ? "Exam passed"
        : getDaysLeft(task.examDate) === 0
        ? "Exam is today!"
        : getDaysLeft(task.examDate) === 1
        ? "1 day left"
        : `${getDaysLeft(task.examDate)} days left`}
    </strong>
  </p>
)}
                    {/* Study hours */}
                    <p>
                      ⏱️ <strong>Study:</strong>{" "}
                      {task.studyHours} hours
                    </p>

                    {/* Status */}
                    <p>
                      <strong>Status:</strong>{" "}

                      {task.completed
                        ? "Completed ✅"
                        : "Not Completed"}
                    </p>

                    {/* Buttons */}
                    <div className="task-buttons">

                      {!task.completed && (

                        <button
                          className="complete-btn"
                          onClick={() =>
                            handleCompleteTask(
                              task._id
                            )
                          }
                        >
                          Mark Complete ✅
                        </button>

                      )}

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteTask(
                            task._id
                          )
                        }
                      >
                        Delete 🗑️
                      </button>

                    </div>

                  </div>
                );

              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;