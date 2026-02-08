import React, { useState } from "react";
import { format } from "date-fns";
import "../Components.Styles/TaskCard.css";

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [showAIInsights, setShowAIInsights] = useState(false);

  const getPriorityClass = (priority) => {
    const classes = {
      1: "task-card-critical",
      2: "task-card-urgent",
      3: "task-card-high",
      4: "task-card-medium",
      5: "task-card-low",
    };
    return classes[priority] || classes[5];
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      1: { class: "priority-critical", label: "Critical", icon: "🔴" },
      2: { class: "priority-urgent", label: "Urgent", icon: "🟠" },
      3: { class: "priority-high", label: "High", icon: "🟡" },
      4: { class: "priority-medium", label: "Medium", icon: "🔵" },
      5: { class: "priority-low", label: "Low", icon: "🟢" },
    };
    return badges[priority] || badges[5];
  };

  const getStatusClass = (status) => {
    const classes = {
      completed: "status-completed",
      "in-progress": "status-in-progress",
      pending: "status-pending",
    };
    return classes[status] || classes.pending;
  };

  const getCategoryClass = (category) => {
    const classes = {
      Design: "category-design",
      Engineering: "category-engineering",
      Marketing: "category-marketing",
      Finance: "category-finance",
      Research: "category-research",
      Operations: "category-operations",
      Work: "category-design",
      Personal: "category-research",
      Health: "category-operations",
      Learning: "category-engineering",
      Documentation: "category-engineering",
    };
    return classes[category] || "category-design";
  };

  const getImpactColor = (impact) => {
    if (impact >= 8) return "text-red-600";
    if (impact >= 5) return "text-yellow-600";
    return "text-green-600";
  };

  const getComplexityBadge = (complexity) => {
    if (complexity >= 4)
      return { label: "High", color: "bg-red-100 text-red-800" };
    if (complexity >= 2)
      return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Low", color: "bg-green-100 text-green-800" };
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.85) return "#10b981";
    if (confidence >= 0.7) return "#f59e0b";
    return "#ef4444";
  };

  const priorityInfo = getPriorityBadge(task.priority);
  const aiInsights = task.ai_insights || {};
  const complexityBadge = getComplexityBadge(task.complexity || 3);
  const daysUntilDue =
    task.days_until_due !== undefined ? task.days_until_due : null;
  const isOverdue = task.is_overdue || false;

  return (
    <div className={`task-card ${getPriorityClass(task.priority)}`}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1 }}>
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                {task.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#4b5563",
                  marginTop: "4px",
                  margin: "4px 0 0 0",
                }}
              >
                {task.description || "No description"}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <span className={`status-badge ${getStatusClass(task.status)}`}>
                {task.status === "in-progress"
                  ? "In Progress"
                  : task.status === "completed"
                    ? "Completed"
                    : "Pending"}
              </span>
              <span
                className={`category-tag ${getCategoryClass(task.category)}`}
              >
                {task.category}
              </span>
              {task.complexity !== undefined && (
                <span className={`complexity-tag ${complexityBadge.color}`}>
                  {complexityBadge.label} Complexity
                </span>
              )}
            </div>
          </div>

          {/* Main Info Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #e5e7eb",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {/* Due Date */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>📅</span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: isOverdue ? "#dc2626" : "#374151",
                  }}
                >
                  {format(new Date(task.due_date || task.dueDate), "MMM dd")}
                </span>
                {daysUntilDue !== null && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: isOverdue ? "#fee2e2" : "#dbeafe",
                      color: isOverdue ? "#7f1d1d" : "#1e40af",
                    }}
                  >
                    {isOverdue
                      ? `${Math.abs(daysUntilDue)} days overdue`
                      : `${daysUntilDue} days left`}
                  </span>
                )}
              </div>

              {/* Priority & Impact */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>{priorityInfo.icon}</span>
                <span className={`priority-badge ${priorityInfo.class}`}>
                  {priorityInfo.label}
                </span>
                <span style={{ color: "#d1d5db" }}>•</span>
                <span className={`${getImpactColor(task.impact)}`}>
                  Impact: {task.impact}/10
                </span>
              </div>

              {/* Estimated Hours */}
              {task.estimated_hours !== undefined && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span>⏱️</span>
                  <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                    {task.estimated_hours}h
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "6px" }}>
              {/* AI Insights Toggle */}
              {aiInsights && Object.keys(aiInsights).length > 0 && (
                <button
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#f3e8ff",
                    color: "#7c3aed",
                    border: "1px solid #ddd6fe",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                  title="View AI Insights"
                >
                  🤖 AI
                </button>
              )}
              <button onClick={() => onEdit(task)} className="edit-btn">
                ✏️
              </button>
              <button onClick={() => onDelete(task.id)} className="delete-btn">
                🗑️
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {task.progress !== undefined && (
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* AI Insights Section */}
          {showAIInsights &&
            aiInsights &&
            Object.keys(aiInsights).length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#f8f5ff",
                  borderRadius: "6px",
                  borderLeft: "4px solid #7c3aed",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#7c3aed",
                    marginBottom: "8px",
                  }}
                >
                  🤖 AI Analysis
                </div>

                {/* Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {aiInsights.complexity_score !== undefined && (
                    <div style={{ fontSize: "0.85rem" }}>
                      <span style={{ color: "#6b7280" }}>
                        Complexity Score:
                      </span>
                      <span style={{ fontWeight: "600", marginLeft: "4px" }}>
                        {aiInsights.complexity_score}/5
                      </span>
                    </div>
                  )}

                  {aiInsights.confidence_score !== undefined && (
                    <div style={{ fontSize: "0.85rem" }}>
                      <span style={{ color: "#6b7280" }}>Confidence:</span>
                      <span
                        style={{
                          fontWeight: "600",
                          marginLeft: "4px",
                          color: getConfidenceColor(
                            aiInsights.confidence_score,
                          ),
                        }}
                      >
                        {(aiInsights.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {aiInsights.estimated_completion_time !== undefined && (
                    <div style={{ fontSize: "0.85rem" }}>
                      <span style={{ color: "#6b7280" }}>Est. Time (AI):</span>
                      <span style={{ fontWeight: "600", marginLeft: "4px" }}>
                        {aiInsights.estimated_completion_time.toFixed(1)}h
                      </span>
                    </div>
                  )}

                  {aiInsights.similar_tasks_completed !== undefined && (
                    <div style={{ fontSize: "0.85rem" }}>
                      <span style={{ color: "#6b7280" }}>Similar Tasks:</span>
                      <span style={{ fontWeight: "600", marginLeft: "4px" }}>
                        {aiInsights.similar_tasks_completed} completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommended Approach */}
                {aiInsights.recommended_approach && (
                  <div style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Recommended Approach:
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#374151",
                        fontWeight: "500",
                      }}
                    >
                      {aiInsights.recommended_approach}
                    </div>
                  </div>
                )}

                {/* Potential Blockers */}
                {aiInsights.potential_blockers &&
                  aiInsights.potential_blockers.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        Potential Blockers:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {aiInsights.potential_blockers.map((blocker, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "0.75rem",
                              padding: "4px 8px",
                              backgroundColor: "#fee2e2",
                              color: "#991b1b",
                              borderRadius: "3px",
                            }}
                          >
                            ⚠️ {blocker}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Suggested Resources */}
                {aiInsights.suggested_resources &&
                  aiInsights.suggested_resources.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        Suggested Resources:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {aiInsights.suggested_resources.map((resource, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "0.75rem",
                              padding: "4px 8px",
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                              borderRadius: "3px",
                            }}
                          >
                            📚 {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
