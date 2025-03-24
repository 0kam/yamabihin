import React from 'react'
import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './AppRouter'
import theme from './theme'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50">
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </Box>
    </ChakraProvider>
  )
}

export default App
