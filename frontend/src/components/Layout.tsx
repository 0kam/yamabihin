import { Box, Container, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Flex>
        <Sidebar />
        <Box as="main" flex="1" p={4}>
          <Container maxW="container.xl">
            {children}
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;