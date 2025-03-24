import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { Login } from '../Login'
import { TestWrapper } from '../../test/utils/TestWrapper'
import { FIXED_PASSWORD } from '../../config'

const LocationDisplay = () => {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

describe('Login Component', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  const renderLogin = () => {
    return render(
      <TestWrapper>
        <LocationDisplay />
        <Login />
      </TestWrapper>
    )
  }

  test('正しいユーザー名とパスワードでログインできる', async () => {
    renderLogin()

    const usernameInput = screen.getByLabelText(/ユーザー名/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /ログイン/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: FIXED_PASSWORD } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(window.localStorage.getItem('yamabihin_username')).toBe('testuser')
      expect(screen.getByTestId('location-display')).toHaveTextContent('/bihin')
    })
  })

  test('パスワードが間違っている場合、エラーメッセージを表示する', async () => {
    renderLogin()

    const usernameInput = screen.getByLabelText(/ユーザー名/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /ログイン/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/パスワードが正しくありません/i)).toBeInTheDocument()
    })
  })

  test('ユーザー名が空の場合、エラーメッセージを表示する', async () => {
    renderLogin()

    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /ログイン/i })

    fireEvent.change(passwordInput, { target: { value: FIXED_PASSWORD } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ユーザー名を入力してください/i)).toBeInTheDocument()
    })
  })

  test('ログイン状態が保持される', async () => {
    // ログイン状態をシミュレート
    window.localStorage.setItem('yamabihin_username', 'testuser')

    renderLogin()

    // ログイン後のリダイレクトをテスト
    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/bihin')
    })
  })
})