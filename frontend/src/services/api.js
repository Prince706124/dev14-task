import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

// Auth service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Comment service
export const commentService = {
  getComments: async (sortBy = 'created_at', order = 'desc', page = 1, limit = 10) => {
    const response = await api.get(`/comments?sort_by=${sortBy}&order=${order}&page=${page}&limit=${limit}`)
    return response.data
  },

  createComment: async (text, parentId = null) => {
    const response = await api.post('/comments', { text, parent_id: parentId })
    return response.data
  },

  updateComment: async (commentId, text) => {
    const response = await api.put(`/comments/${commentId}`, { text })
    return response.data
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data
  },

  upvoteComment: async (commentId) => {
    const response = await api.put(`/comments/${commentId}/upvote`)
    return response.data
  },

  getCommentReplies: async (commentId, page = 1, limit = 10) => {
    const response = await api.get(`/comments/${commentId}/replies?page=${page}&limit=${limit}`)
    return response.data
  },

  getNestedReplies: async (commentId, page = 1, limit = 10) => {
    const response = await api.get(`/comments/${commentId}/nested-replies?page=${page}&limit=${limit}`)
    return response.data
  },

  getCommentsSummary: async () => {
    const response = await api.get('/comments/summary')
    return response.data
  },
}

// Admin service
export const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },

  getPendingComments: async () => {
    const response = await api.get('/admin/pending-comments')
    return response.data
  },

  approveComment: async (commentId) => {
    const response = await api.put(`/admin/comments/${commentId}/approve`)
    return response.data
  },

  rejectComment: async (commentId) => {
    const response = await api.put(`/admin/comments/${commentId}/reject`)
    return response.data
  },

  createAdmin: async (userData) => {
    const response = await api.post('/admin/create-admin', userData)
    return response.data
  },
}
