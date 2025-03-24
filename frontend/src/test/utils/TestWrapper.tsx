import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import theme from '../../theme'

interface TestWrapperProps {
  children: React.ReactNode
  initialEntries?: string[]
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  initialEntries = ['/']
}) => {
  return (
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MemoryRouter>
    </ChakraProvider>
  )
}

export default TestWrapper