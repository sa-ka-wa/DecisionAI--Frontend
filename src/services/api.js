const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Auth state management
let authToken = null;
let currentUser = null;

// Get stored auth data
const getStoredAuth = () => {
  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");

  if (token && userStr) {
    authToken = token;
    currentUser = JSON.parse(userStr);
    return true;
  }

  return false;
};

// Initialize auth
getStoredAuth();

export const isAuthenticated = () => {
  return !!authToken;
};

export const getCurrentUser = () => {
  return currentUser;
};

export const setAuth = (token, user) => {
  authToken = token;
  currentUser = user;
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("refresh_token");
};

// Single apiRequest function (remove duplicate)
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken && !endpoint.includes("/auth/")) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    console.log(`API Request to: ${API_BASE_URL}${endpoint}`);
    if (config.body) {
      console.log("Request payload:", JSON.parse(config.body));
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 - Redirect to login
    if (response.status === 401 && !endpoint.includes("/auth/login")) {
      clearAuth();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error Response:", data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
};

// Single Auth API (remove duplicate)
export const authApi = {
  register: async (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (email, password) => {
    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data.access_token) {
        setAuth(response.data.access_token, response.data.user);
        console.log("Login successful, user:", response.data.user);
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.message || "Login failed. Please check your credentials.",
      };
    }
  },

  logout: async () => {
    try {
      const response = await apiRequest("/auth/logout", {
        method: "POST",
      });
      clearAuth();
      return response;
    } catch (error) {
      console.error("Logout error:", error);
      clearAuth(); // Clear anyway
      return { success: true, message: "Logged out" };
    }
  },

  getProfile: async () => {
    return apiRequest("/auth/profile");
  },

  updateProfile: async (profileData) => {
    return apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};

// Tasks API (matches your backend routes)
export const tasksApi = {
  getTasks: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/tasks${queryParams ? `?${queryParams}` : ""}`);
  },

  getTaskById: async (id) => {
    return apiRequest(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    // Transform frontend data to match backend schema
    const backendTaskData = {
      title: taskData.title,
      description: taskData.description || "",
      category: taskData.category || "Other",
      priority: taskData.priority || 3,
      impact: taskData.impact || 5,
      status: taskData.status || "pending",
      progress: taskData.progress || 0,
      due_date: taskData.dueDate
        ? new Date(taskData.dueDate).toISOString()
        : new Date().toISOString(), // Convert to ISO 8601 format
      tags: taskData.tags || [],
      complexity: taskData.complexity || 3,
      estimated_hours: taskData.estimatedHours || 1.0,
    };

    return apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(backendTaskData),
    });
  },

  updateTask: async (id, taskData) => {
    // Transform data if needed
    const backendTaskData = {
      ...taskData,
      due_date: taskData.dueDate
        ? new Date(taskData.dueDate).toISOString()
        : taskData.due_date,
      estimated_hours: taskData.estimatedHours || taskData.estimated_hours,
    };

    // Remove undefined values
    Object.keys(backendTaskData).forEach((key) => {
      if (backendTaskData[key] === undefined) {
        delete backendTaskData[key];
      }
    });

    return apiRequest(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(backendTaskData),
    });
  },

  deleteTask: async (id) => {
    return apiRequest(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  updateTaskStatus: async (id, status) => {
    return apiRequest(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  updateTaskProgress: async (id, progress) => {
    return apiRequest(`/tasks/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ progress }),
    });
  },

  getTasksByCategory: async (category) => {
    return apiRequest(`/tasks/category/${category}`);
  },

  getTasksByPriority: async (priority) => {
    return apiRequest(`/tasks/priority/${priority}`);
  },

  getOverdueTasks: async () => {
    return apiRequest("/tasks/overdue");
  },

  getUpcomingTasks: async () => {
    return apiRequest("/tasks/upcoming");
  },

  bulkCreateTasks: async (tasks) => {
    // Transform tasks to match backend schema
    const backendTasks = tasks.map((task) => ({
      title: task.title,
      description: task.description || "",
      category: task.category || "Other",
      priority: task.priority || 3,
      impact: task.impact || 5,
      status: task.status || "pending",
      progress: task.progress || 0,
      due_date: task.dueDate
        ? new Date(task.dueDate).toISOString()
        : new Date().toISOString(),
      tags: task.tags || [],
      complexity: task.complexity || 3,
      estimated_hours: task.estimatedHours || 1.0,
    }));

    return apiRequest("/tasks/bulk", {
      method: "POST",
      body: JSON.stringify({ tasks: backendTasks }),
    });
  },

  bulkDeleteTasks: async (taskIds) => {
    return apiRequest("/tasks/bulk", {
      method: "DELETE",
      body: JSON.stringify({ task_ids: taskIds }),
    });
  },
};

// Analytics API (matches your backend routes)
export const analyticsApi = {
  getDashboardStats: async () => {
    return apiRequest("/analytics/dashboard");
  },

  getCompletionRate: async (period = "week") => {
    return apiRequest(`/analytics/completion-rate?period=${period}`);
  },

  getCategoryBreakdown: async () => {
    return apiRequest("/analytics/category-breakdown");
  },

  getImpactAnalysis: async () => {
    return apiRequest("/analytics/impact-analysis");
  },

  getPriorityDistribution: async () => {
    return apiRequest("/analytics/priority-distribution");
  },

  getTimelineData: async () => {
    return apiRequest("/analytics/timeline");
  },

  getPerformanceMetrics: async () => {
    return apiRequest("/analytics/performance");
  },

  getProductivityScore: async () => {
    return apiRequest("/analytics/productivity");
  },

  getAIRecommendations: async () => {
    return apiRequest("/analytics/ai/recommendations");
  },

  getOptimizationTips: async () => {
    return apiRequest("/analytics/ai/optimization");
  },

  getRiskAnalysis: async () => {
    return apiRequest("/analytics/ai/risk-analysis");
  },

  exportData: async (format = "json") => {
    return apiRequest(`/analytics/export?format=${format}`);
  },
};

// Enhanced getTasks with auth (for backward compatibility)
export const getTasks = async () => {
  try {
    if (!isAuthenticated()) {
      console.warn("User not authenticated. Redirecting to login...");
      window.location.href = "/login";
      return [];
    }

    console.log("Fetching tasks...");
    const response = await apiRequest("/tasks");

    return response.success ? response.data : [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// For backward compatibility with old code
export const addTask = tasksApi.createTask;
export const updateTask = tasksApi.updateTask;
export const deleteTask = tasksApi.deleteTask;

// Main API export
export const api = {
  // Auth
  register: authApi.register,
  login: authApi.login,
  logout: authApi.logout,
  getProfile: authApi.getProfile,
  updateProfile: authApi.updateProfile,

  // Tasks
  ...tasksApi,

  // Analytics
  ...analyticsApi,

  // Helper functions
  isAuthenticated: () => !!authToken,
  getCurrentUser: () => currentUser,
  setAuthTokens: (tokens) => {
    if (tokens.access_token) {
      localStorage.setItem("access_token", tokens.access_token);
    }
    if (tokens.refresh_token) {
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }
  },
  clearAuth,
};
