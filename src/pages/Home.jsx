import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format as dateFnsFormat } from "date-fns";
import { getTasks, api } from "../services/api";
import "../Pages.Styles/Home.css";

const Home = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    criticalPriority: 0,
    avgImpact: 0,
    completionRate: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  // Default AI recommendations for fallback
  const defaultRecommendations = {
    focus_areas: [
      "Complete high-priority tasks first",
      "Focus on high-impact work",
    ],
    quick_wins: ["Review pending tasks", "Prioritize urgent items"],
    risk_alerts: ["Check for dependencies", "Monitor deadlines"],
    optimization_tips: [
      "Schedule focused time blocks",
      "Break large tasks into subtasks",
    ],
    efficiency_score: 65,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasks = await getTasks();

        // Compute stats
        const completed = tasks.filter((t) => t.status === "completed").length;
        const criticalPriority = tasks.filter((t) => t.priority <= 2).length;
        const avgImpact =
          tasks.reduce((sum, t) => sum + t.impact, 0) / (tasks.length || 1);
        const completionRate =
          tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

        setStats({
          totalTasks: tasks.length,
          completed,
          criticalPriority,
          avgImpact: avgImpact.toFixed(1),
          completionRate,
        });

        // Set recent tasks
        setRecentTasks(tasks.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    const fetchAIRecommendations = async () => {
      setAiLoading(true);
      setAiError(null);
      try {
        const response = await api.getAIRecommendations();
        if (response.success && response.data) {
          setAiRecommendations(response.data);
        } else {
          console.warn("Failed to fetch AI recommendations:", response.message);
          setAiRecommendations(defaultRecommendations);
        }
      } catch (err) {
        console.error("Error fetching AI recommendations:", err);
        setAiError(err.message);
        setAiRecommendations(defaultRecommendations);
      } finally {
        setAiLoading(false);
      }
    };

    fetchData();
    fetchAIRecommendations();
  }, []);

  const recommendations = aiRecommendations || defaultRecommendations;

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="hero">
        <h1>
          AI-Assisted <span className="gradient-text">Decision Dashboard</span>
        </h1>
        <p>
          Prioritize what matters. Track impact. Ship faster with AI-powered
          task intelligence.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card-gradient dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value">{stats.totalTasks}</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <div className="stat-footer">+2 this week</div>
        </div>

        <div className="stat-card-gradient-success dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <div className="stat-footer">
            {stats.completionRate}% completion rate
          </div>
        </div>

        <div className="stat-card-gradient-warning dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Critical Priority</div>
              <div className="stat-value">{stats.criticalPriority}</div>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
          <div className="stat-footer">Needs immediate attention</div>
        </div>

        <div className="stat-card-gradient-danger dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Avg Impact</div>
              <div className="stat-value">{stats.avgImpact}</div>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <div className="stat-footer">Overall task impact score</div>
        </div>
      </div>

      {/* Recent Tasks & AI */}
      <div className="recent-ai-grid">
        {/* Recent Tasks */}
        <div>
          <div className="dashboard-card">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Tasks</h2>
              <Link to="/tasks" className="text-blue-600 font-medium text-sm">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="recent-task-card">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    </div>
                    <span
                      className={`status-badge ${
                        task.status === "completed"
                          ? "status-completed"
                          : task.status === "in-progress"
                            ? "status-in-progress"
                            : "status-pending"
                      }`}
                    >
                      {task.status === "in-progress"
                        ? "In-progress"
                        : task.status === "completed"
                          ? "Completed"
                          : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-3">
                    <span
                      className={`category-tag ${
                        "category-" + task.category.toLowerCase()
                      }`}
                    >
                      {task.category}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`priority-badge ${
                          task.priority <= 2
                            ? "priority-critical"
                            : task.priority === 3
                              ? "priority-urgent"
                              : "priority-high"
                        }`}
                      >
                        {task.priority <= 2
                          ? "Critical"
                          : task.priority === 3
                            ? "Urgent"
                            : "High"}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        Impact: {task.impact}/10
                      </span>
                      <span className="text-sm text-gray-500">
                        {dateFnsFormat(
                          new Date(task.due_date || task.dueDate),
                          "MMM dd",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="ai-bubble">
          <div className="flex items-center mb-4">
            <div className="ai-avatar blue">AI</div>
            <div>
              <h3 className="font-bold text-gray-800">AI Recommendations</h3>
              <p className="text-sm text-gray-600">
                {aiLoading
                  ? "Loading insights..."
                  : "Based on your current workload"}
              </p>
            </div>
          </div>

          {aiLoading ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}
            >
              ⏳ Analyzing your tasks...
            </div>
          ) : aiError ? (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fef3c7",
                borderRadius: "6px",
                color: "#78350f",
                fontSize: "0.875rem",
                marginTop: "8px",
              }}
            >
              ⚠️ Using default recommendations (API unavailable)
            </div>
          ) : null}

          <div className="space-y-4">
            {/* Focus Areas */}
            {recommendations.focus_areas &&
              recommendations.focus_areas.length > 0 && (
                <div className="ai-card blue">
                  <div className="flex items-center mb-1">
                    <span className="text-blue-500 mr-2">🎯</span>
                    <span className="font-medium text-sm text-gray-800">
                      Focus Priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {recommendations.focus_areas[0]}
                  </p>
                </div>
              )}

            {/* Quick Wins */}
            {recommendations.quick_wins &&
              recommendations.quick_wins.length > 0 && (
                <div className="ai-card purple">
                  <div className="flex items-center mb-1">
                    <span className="text-purple-500 mr-2">🚀</span>
                    <span className="font-medium text-sm text-gray-800">
                      Quick Win
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {recommendations.quick_wins[0]}
                  </p>
                </div>
              )}

            {/* Optimization Tips */}
            {recommendations.optimization_tips &&
              recommendations.optimization_tips.length > 0 && (
                <div className="ai-card green">
                  <div className="flex items-center mb-1">
                    <span className="text-green-500 mr-2">📈</span>
                    <span className="font-medium text-sm text-gray-800">
                      Efficiency Tip
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {recommendations.optimization_tips[0]}
                  </p>
                </div>
              )}

            {/* Efficiency Score */}
            {recommendations.efficiency_score !== undefined && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "6px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#0066cc",
                    fontWeight: "600",
                  }}
                >
                  📊 Efficiency Score: {recommendations.efficiency_score}/100
                </div>
              </div>
            )}
          </div>

          <button className="btn-primary mt-6 w-full">
            Generate Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
