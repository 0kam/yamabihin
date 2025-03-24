import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import BihinList from './pages/BihinList'
import BihinForm from './pages/BihinForm'
import MovementForm from './pages/MovementForm'
import Login from './pages/Login'
import { useAuth } from './contexts/AuthContext'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

const AppRouter: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()

  // ログイン済みの場合、ログインページにアクセスしたら一覧ページにリダイレクト
  if (user?.isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* 備品関連のルート */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <BihinList />
          </PrivateRoute>
        }
      />
      <Route
        path="/bihin/new"
        element={
          <PrivateRoute>
            <BihinForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/bihin/:id/edit"
        element={
          <PrivateRoute>
            <BihinForm />
          </PrivateRoute>
        }
      />

      {/* 移動履歴関連のルート */}
      <Route
        path="/movement/:bihinId"
        element={
          <PrivateRoute>
            <MovementForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/movement/:bihinId/edit/:movementId"
        element={
          <PrivateRoute>
            <MovementForm />
          </PrivateRoute>
        }
      />

      {/* 未定義のパスは一覧ページにリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter