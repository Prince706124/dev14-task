import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight, 
  ThumbsUp, 
  Reply, 
  MoreVertical, 
  Edit, 
  Trash2,
  User,
  Clock,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useComments } from '../contexts/CommentContext'
import { commentService } from '../services/api'
import CommentForm from './CommentForm'
import toast from 'react-hot-toast'

const CommentItem = ({ comment, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [replies, setReplies] = useState(comment.replies || [])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [repliesLoaded, setRepliesLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreReplies, setHasMoreReplies] = useState(false)
  const [nestedReplies, setNestedReplies] = useState({})
  const [loadingNestedReplies, setLoadingNestedReplies] = useState({})
  const [nestedRepliesLoaded, setNestedRepliesLoaded] = useState({})
  
  const { user } = useAuth()
  const { updateComment, deleteComment, upvoteComment } = useComments()

  const canEdit = user?.id === comment.user_id || user?.is_admin
  const canDelete = user?.id === comment.user_id || user?.is_admin

  const handleUpvote = async () => {
    if (isUpvoting) return
    
    setIsUpvoting(true)
    try {
      await upvoteComment(comment.id)
      toast.success('Comment upvoted!')
    } catch (error) {
      toast.error('Failed to upvote comment')
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleEdit = async () => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    try {
      await updateComment(comment.id, editText.trim())
      setShowEditForm(false)
      toast.success('Comment updated!')
    } catch (error) {
      toast.error('Failed to update comment')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteComment(comment.id)
      toast.success('Comment deleted!')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const loadReplies = async (page = 1, append = false) => {
    if (loadingReplies) return
    
    setLoadingReplies(true)
    try {
      const fetchedReplies = await commentService.getCommentReplies(comment.id, page, 10)
      if (append) {
        setReplies(prev => [...prev, ...fetchedReplies])
      } else {
        setReplies(fetchedReplies)
        setRepliesLoaded(true)
      }
      setCurrentPage(page)
      setHasMoreReplies(fetchedReplies.length === 10)
    } catch (error) {
      toast.error('Failed to load replies')
    } finally {
      setLoadingReplies(false)
    }
  }

  const loadMoreReplies = async () => {
    await loadReplies(currentPage + 1, true)
  }

  const loadNestedReplies = async (replyId, page = 1, append = false) => {
    if (loadingNestedReplies[replyId]) return
    
    setLoadingNestedReplies(prev => ({ ...prev, [replyId]: true }))
    try {
      const fetchedNestedReplies = await commentService.getNestedReplies(replyId, page, 10)
      if (append) {
        setNestedReplies(prev => ({
          ...prev,
          [replyId]: [...(prev[replyId] || []), ...fetchedNestedReplies]
        }))
      } else {
        setNestedReplies(prev => ({
          ...prev,
          [replyId]: fetchedNestedReplies
        }))
        setNestedRepliesLoaded(prev => ({ ...prev, [replyId]: true }))
      }
    } catch (error) {
      toast.error('Failed to load nested replies')
    } finally {
      setLoadingNestedReplies(prev => ({ ...prev, [replyId]: false }))
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getLevelClass = (level) => {
    // Limit nesting to 3 levels for better UX
    const maxLevel = Math.min(level, 3)
    const classes = {
      0: 'comment-thread-level-1',
      1: 'comment-thread-level-2',
      2: 'comment-thread-level-3',
      3: 'comment-thread-level-4',
    }
    return classes[maxLevel] || 'comment-thread-level-4'
  }

  const getBorderColor = (level) => {
    const colors = {
      0: 'border-gray-200',
      1: 'border-blue-200',
      2: 'border-green-200',
      3: 'border-purple-200',
    }
    return colors[Math.min(level, 3)] || 'border-gray-300'
  }

  return (
    <motion.div
      layout
      className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-3 sm:p-4 ${getLevelClass(level)} ${getBorderColor(level)}`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={comment.user.avatar}
            alt={comment.user.name}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
          />
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-100 text-sm sm:text-base">{comment.user.name}</span>
              {comment.user.is_admin && (
                <Shield className="w-3 h-3 text-yellow-500" />
              )}
              <span className="text-xs sm:text-sm text-gray-400">•</span>
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(comment.created_at)}</span>
              </div>
            </div>

            {/* Actions Menu */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]"
                    >
                      {canEdit && (
                        <button
                          onClick={() => {
                            setShowEditForm(true)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            handleDelete()
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Comment Text */}
          {showEditForm ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowEditForm(false)
                    setEditText(comment.text)
                  }}
                  className="btn btn-secondary px-4 py-2 text-sm"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          ) : (
            <p className="text-gray-200 leading-relaxed mb-3">{comment.text}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpvote}
              disabled={isUpvoting}
              className="flex items-center space-x-1 text-gray-400 hover:text-primary-500 transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{comment.upvotes}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-gray-400 hover:text-primary-500 transition-colors text-xs sm:text-sm"
            >
              <Reply className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">Reply</span>
            </motion.button>

            {((comment.replies?.length > 0 || replies.length > 0) || comment.has_more) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!repliesLoaded && !loadingReplies) {
                    await loadReplies()
                  }
                  setIsExpanded(!isExpanded)
                }}
                disabled={loadingReplies}
                className="flex items-center space-x-1 text-gray-400 hover:text-primary-500 transition-colors text-xs sm:text-sm disabled:opacity-50"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="font-medium">
                  {loadingReplies ? 'Loading...' : 
                   isExpanded ? 'Hide' : 'Show'} {replies.length || comment.replies?.length || comment.total_count || 0}
                </span>
              </motion.button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <CommentForm
                  parentId={comment.id}
                  onCancel={() => setShowReplyForm(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
        
          {/* Replies */}
          <AnimatePresence>
            {isExpanded && ((replies.length > 0 || comment.replies?.length > 0) || comment.has_more) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {loadingReplies ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-sm text-gray-400">Loading replies...</span>
                  </div>
                ) : (
                  <>
                    {(replies.length > 0 ? replies : comment.replies || []).map((reply) => (
                      <div key={reply.id}>
                        <CommentItem
                          comment={reply}
                          level={level + 1}
                        />
                        {/* Show nested replies if they exist and are loaded */}
                        {nestedReplies[reply.id] && nestedReplies[reply.id].length > 0 && (
                          <div className="mt-2">
                            {nestedReplies[reply.id].map((nestedReply) => (
                              <CommentItem
                                key={nestedReply.id}
                                comment={nestedReply}
                                level={level + 2}
                              />
                            ))}
                          </div>
                        )}
                       
                      </div>
                    ))}
                    {hasMoreReplies && (
                      <div className="flex justify-center pt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={loadMoreReplies}
                          className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Load More Replies
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
    </motion.div>
  )
}

export default CommentItem
