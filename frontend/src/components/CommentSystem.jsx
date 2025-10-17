import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, TrendingUp, Clock, Filter, Shield } from 'lucide-react'
import CommentList from './CommentList'
import CommentForm from './CommentForm'
import SortControls from './SortControls'
import AdminPanel from './AdminPanel'
import { useComments } from '../contexts/CommentContext'
import { useAuth } from '../contexts/AuthContext'
import { commentService } from '../services/api'

const CommentSystem = () => {
  const { comments, loading, loadingMore, hasMore, sortBy, sortOrder, handleSortChange, loadMoreComments } = useComments()
  const { user } = useAuth()
  const [showSortControls, setShowSortControls] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(true)
  const [summary, setSummary] = useState({ total_comments: 0, total_upvotes: 0 })
  const [loadingSummary, setLoadingSummary] = useState(true)

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true)
        const summaryData = await commentService.getCommentsSummary()
        setSummary(summaryData)
      } catch (error) {
        console.error('Error fetching summary:', error)
      } finally {
        setLoadingSummary(false)
      }
    }

    fetchSummary()
  }, [])

  // If admin, show only admin panel
  if (user?.is_admin) {
    return (
      <div className="space-y-6">
       

        {/* Admin Panel */}
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminPanel />
          </motion.div>
        )}

        {/* Admin Message */}
        {!showAdminPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8 text-center"
          >
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Admin Dashboard</h3>
          </motion.div>
        )}
      </div>
    )
  }

  // Regular user interface
  return (
    <div className="space-y-6">
      {/* Post Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-100 mb-2">
              Welcome to Our Discussion Platform
            </h2>
            <p className="text-gray-300 leading-relaxed">
              This is a sample post to demonstrate our nested commenting system. 
              Feel free to share your thoughts, ask questions, or engage in meaningful 
              discussions with the community. The comment system supports unlimited nesting 
              levels, upvoting, and real-time interactions.
            </p>
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>
                  {loadingSummary ? 'Loading...' : `${summary.total_comments} comments`}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {loadingSummary ? 'Loading...' : `${summary.total_upvotes} total reactions`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-300">Sort Comments</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSortControls(!showSortControls)}
            className="btn btn-secondary px-4 py-2"
          >
            {sortBy === 'created_at' && <Clock className="w-4 h-4 mr-2" />}
            {sortBy === 'upvotes' && <TrendingUp className="w-4 h-4 mr-2" />}
            {sortBy === 'replies' && <MessageSquare className="w-4 h-4 mr-2" />}
            {sortBy === 'created_at' && 'Newest First'}
            {sortBy === 'upvotes' && 'Most Popular'}
            {sortBy === 'replies' && 'Most Replies'}
          </motion.button>
        </div>

        {showSortControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Comment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CommentForm />
      </motion.div>

      {/* Comments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CommentList 
          comments={comments} 
          loading={loading} 
          onLoadMore={loadMoreComments}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      </motion.div>
    </div>
  )
}

export default CommentSystem
