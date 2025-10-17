import React, { createContext, useContext, useState, useEffect } from 'react'
import { commentService } from '../services/api'

const CommentContext = createContext()

export const useComments = () => {
  const context = useContext(CommentContext)
  if (!context) {
    throw new Error('useComments must be used within a CommentProvider')
  }
  return context
}

export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const fetchComments = async (page = 1, limit = 10, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    
    try {
      const data = await commentService.getComments(sortBy, sortOrder, page, limit)
      
      if (append) {
        setComments(prev => [...prev, ...data])
      } else {
        setComments(data)
      }
      
      setCurrentPage(page)
      setHasMore(data.length === limit)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreComments = async () => {
    await fetchComments(currentPage + 1, 10, true)
  }

  const addComment = async (text, parentId = null) => {
    try {
      const newComment = await commentService.createComment(text, parentId)
      await fetchComments() // Refresh the list
      return newComment
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  const updateComment = async (commentId, text) => {
    try {
      await commentService.updateComment(commentId, text)
      await fetchComments() // Refresh the list
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId)
      await fetchComments() // Refresh the list
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  const upvoteComment = async (commentId) => {
    try {
      await commentService.upvoteComment(commentId)
      await fetchComments() // Refresh the list
    } catch (error) {
      console.error('Error upvoting comment:', error)
      throw error
    }
  }

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
    // Don't call fetchComments here, let the useEffect handle it
  }

  useEffect(() => {
    fetchComments(1, 10, false)
  }, [sortBy, sortOrder])

  const value = {
    comments,
    loading,
    loadingMore,
    hasMore,
    sortBy,
    sortOrder,
    fetchComments,
    loadMoreComments,
    addComment,
    updateComment,
    deleteComment,
    upvoteComment,
    handleSortChange
  }

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  )
}
