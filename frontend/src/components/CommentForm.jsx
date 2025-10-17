import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useComments } from '../contexts/CommentContext'

const CommentForm = ({ parentId = null, onCancel = null }) => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const { addComment } = useComments()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.error('Please enter a comment')
      return
    }

    setLoading(true)
    try {
      await addComment(text.trim(), parentId)
      setText('')
      if (onCancel) onCancel()
      toast.success(parentId ? 'Reply posted!' : 'Comment posted!')
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={parentId ? 'Write a reply...' : 'Share your thoughts...'}
              className="w-full p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          {onCancel && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 font-medium"
              disabled={loading}
            >
              Cancel
            </motion.button>
          )}
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || !text.trim()}
            className="btn btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Posting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>{parentId ? 'Reply' : 'Comment'}</span>
              </div>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default CommentForm
