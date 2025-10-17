import React from 'react'
import { motion } from 'framer-motion'
import { LogOut, User, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, handleLogout } = useAuth()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-3 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-100 truncate">Nested Comments</h1>
            <p className="text-sm sm:text-base text-gray-400 hidden sm:block">Interactive discussion platform</p>
          </div>
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-none">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
            />
            <div className="min-w-0 flex-1 sm:flex-none">
              <p className="text-sm font-medium text-gray-100 truncate">{user?.name}</p>
              <div className="flex items-center space-x-1">
                {user?.is_admin && (
                  <Shield className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                )}
                <p className="text-xs text-gray-400 truncate">
                  {user?.is_admin ? 'Admin' : 'User'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
