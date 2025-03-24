import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
    >
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl">404</Heading>
        <Heading size="xl">ページが見つかりません</Heading>
        <Text color="gray.600">
          お探しのページは存在しないか、移動した可能性があります。
        </Text>
        <Button
          colorScheme="brand"
          size="lg"
          onClick={() => navigate('/')}
        >
          ホームに戻る
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;