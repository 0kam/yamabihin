import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { checkSession, login as apiLogin } from '../services/api'
import { AuthUser } from '../types'
import { config } from '../config'
import { useToast } from '@chakra-ui/react'

interface AuthContextType {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isInitialized: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUsername = localStorage.getItem(config.storageKeys.username)
    return savedUsername
      ? {
          username: savedUsername,
          isAuthenticated: true
        }
      : null
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log('Verifying session...')
        const savedUsername = localStorage.getItem(config.storageKeys.username)
        
        if (savedUsername) {
          console.log('Found saved username:', savedUsername)
          const data = await checkSession()
          if (data.username) {
            console.log('Session verified for:', data.username)
            setUser({
              username: data.username,
              isAuthenticated: true
            })
          } else {
            console.log('Session invalid, clearing stored data')
            localStorage.removeItem(config.storageKeys.username)
            localStorage.removeItem(config.storageKeys.lastLogin)
            setUser(null)
            navigate('/login', { replace: true })
          }
        } else {
          console.log('No saved session found')
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true })
          }
        }
      } catch (error) {
        console.error('Session verification failed:', error)
        localStorage.removeItem(config.storageKeys.username)
        localStorage.removeItem(config.storageKeys.lastLogin)
        setUser(null)
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true })
        }
      } finally {
        setIsInitialized(true)
      }
    }

    verifySession()
  }, [navigate, location.pathname])

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login for:', username)
      const data = await apiLogin(username, password)
      const newUser = {
        username: data.username,
        isAuthenticated: true
      }
      setUser(newUser)
      localStorage.setItem(config.storageKeys.username, data.username)
      localStorage.setItem(config.storageKeys.lastLogin, new Date().toISOString())
      console.log('Login successful')
      
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
      
      toast({
        title: 'ログイン成功',
        description: 'ようこそ、' + username + 'さん',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Login failed:', error)
      toast({
        title: 'ログイン失敗',
        description: 'ユーザー名またはパスワードが正しくありません',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      throw new Error('ログインに失敗しました')
    }
  }

  const logout = async () => {
    try {
      console.log('Logging out')
      // セッションクリア
      setUser(null)
      localStorage.removeItem(config.storageKeys.username)
      localStorage.removeItem(config.storageKeys.lastLogin)

      // ログアウト成功通知
      toast({
        title: 'ログアウト完了',
        description: 'また来てください',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // ログインページへリダイレクト
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        title: 'エラー',
        description: 'ログアウトに失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      throw error
    }
  }

  if (!isInitialized) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}