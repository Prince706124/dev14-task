import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { CommentProvider } from './contexts/CommentContext'
import AuthPage from './components/AuthPage'
import CommentSystem from './components/CommentSystem'
import Header from './components/Header'
import { authService } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Verify token and get current user info
          const userData = await authService.getCurrentUser()
          setIsAuthenticated(true)
          setUser(userData)
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    }
    
    checkAuth()
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthProvider value={{ user, isAuthenticated, handleLogin, handleLogout }}>
      <CommentProvider>
        <div className="min-h-screen bg-gray-900">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          {!isAuthenticated ? (
            <AuthPage onLogin={handleLogin} />
          ) : (
            <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
              <Header />
              <div className="mt-8">
                <CommentSystem />
              </div>
            </div>
          )}
        </div>
      </CommentProvider>
    </AuthProvider>
  )
}

export default App
