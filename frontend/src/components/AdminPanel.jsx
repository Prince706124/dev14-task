import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { adminService } from '../services/api'
import toast from 'react-hot-toast'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [pendingComments, setPendingComments] = useState([])
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers()
      fetchPendingComments()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to fetch users')
    }
  }

  const fetchPendingComments = async () => {
    try {
      const data = await adminService.getPendingComments()
      setPendingComments(data)
    } catch (error) {
      toast.error('Failed to fetch pending comments')
    }
  }

  const approveComment = async (commentId) => {
    setLoading(true)
    try {
      await adminService.approveComment(commentId)
      toast.success('Comment approved!')
      fetchPendingComments()
    } catch (error) {
      toast.error('Failed to approve comment')
    } finally {
      setLoading(false)
    }
  }

  const rejectComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to reject this comment? This will delete it permanently.')) {
      return
    }

    setLoading(true)
    try {
      await adminService.rejectComment(commentId)
      toast.success('Comment rejected and deleted!')
      fetchPendingComments()
    } catch (error) {
      toast.error('Failed to reject comment')
    } finally {
      setLoading(false)
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border p-8 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-100 mb-2">Access Denied</h2>
        <p className="text-gray-400">You need admin privileges to access this panel.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg shadow-sm border p-6"
      >
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Admin Panel</h1>
            <p className="text-gray-400">Manage users and moderate comments</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg shadow-sm border p-4"
      >
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-primary-600 text-white border border-primary-500'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users ({users.length})</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('comments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'comments'
                ? 'bg-primary-600 text-white border border-primary-500'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Pending Comments ({pendingComments.length})</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-100">All Users</h2>
            <p className="text-gray-400">Manage user accounts and permissions</p>
          </div>
          
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-100">{user.name}</span>
                      {user.is_admin && (
                        <Shield className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user.is_admin ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-700 text-gray-200 text-xs font-medium rounded">
                      User
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {pendingComments.length === 0 ? (
            <div className="bg-gray-800 rounded-lg shadow-sm border p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">No Pending Comments</h3>
              <p className="text-gray-400">All comments have been moderated!</p>
            </div>
          ) : (
            pendingComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg shadow-sm border p-6"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-100">{comment.user.name}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">Pending</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-200 mb-4">{comment.text}</p>
                    
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approveComment(comment.id)}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => rejectComment(comment.id)}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}

export default AdminPanel
