import { useState } from "react";

function StudentInputForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    subject: "",
    examDate: "",
    studyHours: "",
    difficulty: "Medium",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            studyHours: Number(formData.studyHours),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      onSubmit(result.data);

      // Clear the form
      setFormData({
        subject: "",
        examDate: "",
        studyHours: "",
        difficulty: "Medium",
      });
    } catch (error) {
      console.error("Error submitting task:", error);
      alert("Could not save the task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="subject">Subject Name</label>

        <input
          id="subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g. Mathematics"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="examDate">Exam Date</label>

        <input
          id="examDate"
          name="examDate"
          type="date"
          value={formData.examDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="studyHours">
          Available Study Hours
        </label>

        <input
          id="studyHours"
          name="studyHours"
          type="number"
          min="0.5"
          step="0.5"
          value={formData.studyHours}
          onChange={handleChange}
          placeholder="e.g. 3"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="difficulty">Difficulty Level</label>

        <select
          id="difficulty"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <button
        className="add-task-btn"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : "Add Study Task ➕"}
      </button>
    </form>
  );
}

export default StudentInputForm;