import React from 'react'
import { motion } from 'framer-motion'
import { Clock, TrendingUp, MessageSquare, ArrowUpDown } from 'lucide-react'

const SortControls = ({ sortBy, sortOrder, onSortChange }) => {
  const sortOptions = [
    { value: 'created_at', label: 'Date', icon: Clock },
    { value: 'upvotes', label: 'Upvotes', icon: TrendingUp },
    { value: 'replies', label: 'Replies', icon: MessageSquare },
  ]

  const orderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sort by
        </label>
        <div className="flex space-x-2">
          {sortOptions.map((option) => {
            const Icon = option.icon
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSortChange(option.value, sortOrder)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Order
        </label>
        <div className="flex space-x-2">
          {orderOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSortChange(sortBy, option.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                sortOrder === option.value
                  ? 'bg-primary-600 border-primary-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm font-medium">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SortControls
