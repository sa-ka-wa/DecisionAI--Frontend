import React, { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import { api } from "../services/api";
import "../Pages.Styles/Tasks.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Work",
    priority: 3,
    impact: 5,
    dueDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.getTasks();
        if (response.success) {
          setTasks(response.data);
        } else {
          console.error("Failed to fetch tasks:", response.message);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // For development, use dummy data if API fails
        const dummyTasks = [
          {
            id: 1,
            title: "Example Task",
            category: "Work",
            priority: 3,
            impact: 5,
            dueDate: "2024-02-15",
            status: "pending",
            progress: 0,
          },
        ];
        setTasks(dummyTasks);
      }
    };
    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "priority" || name === "impact" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const response = await api.updateTask(editingTask.id, formData);
        if (response.success) {
          // Update local state
          setTasks(
            tasks.map((task) =>
              task.id === editingTask.id ? response.data : task,
            ),
          );
          resetForm();
          setIsModalOpen(false);
        }
      } else {
        const response = await api.createTask(formData);
        if (response.success) {
          // Add new task to local state
          setTasks([...tasks, response.data]);
          resetForm();
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      priority: task.priority,
      impact: task.impact,
      dueDate: task.dueDate
        ? task.dueDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };
  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await api.deleteTask(taskId);
        if (response.success) {
          // Remove task from local state
          setTasks(tasks.filter((task) => task.id !== taskId));
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Work",
      priority: 3,
      impact: 5,
      dueDate: new Date().toISOString().split("T")[0],
    });
    setEditingTask(null);
  };

  const categories = [
    "Work",
    "Personal",
    "Health",
    "Finance",
    "Learning",
    "Other",
  ];
  const priorities = [
    { value: 1, label: "Critical 🔥" },
    { value: 2, label: "High ⚡" },
    { value: 3, label: "Medium ⚠️" },
    { value: 4, label: "Low 📝" },
    { value: 5, label: "Minimal 💤" },
  ];

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1>Task Management</h1>
          <p>Add, edit, and prioritize your tasks with AI assistance</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add New Task
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{tasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">High Priority Tasks</div>
          <div className="stat-value">
            {tasks.filter((t) => t.priority <= 2).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg Completion</div>
          <div className="stat-value">
            {tasks.length > 0
              ? Math.round(
                  (tasks.filter((t) => t.priority >= 4).length / tasks.length) *
                    100,
                )
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "4rem" }}>📋</div>
          <h3>No tasks yet</h3>
          <p>Add your first task to get started!</p>
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>
            Create Your First Task
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? "Edit Task" : "New Task"}</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div>
                <label>Task Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Impact (1-10)</label>
                  <input
                    type="range"
                    name="impact"
                    min="1"
                    max="10"
                    value={formData.impact}
                    onChange={handleInputChange}
                  />
                  <div className="range-value">{formData.impact}/10</div>
                </div>
              </div>

              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
