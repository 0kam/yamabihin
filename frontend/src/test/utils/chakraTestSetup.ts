import '@testing-library/jest-dom'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../../theme'

const chakraWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
)

export { chakraWrapper }