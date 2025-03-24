import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import App from './App'
import { TestWrapper } from './test/utils/TestWrapper'

const LocationDisplay = () => {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

describe('App', () => {
  test('未認証ユーザーはログインページにリダイレクトされる', async () => {
    render(
      <TestWrapper initialEntries={['/']}>
        <LocationDisplay />
        <App />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/login')
    })
  })
})
