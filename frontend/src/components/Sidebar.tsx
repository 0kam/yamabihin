import {
  Box,
  VStack,
  Link,
  Icon,
  Text,
  useColorModeValue,
  BoxProps,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FiHome,
  FiBox,
  FiTruck,
  FiActivity
} from 'react-icons/fi';

interface NavItemProps extends BoxProps {
  icon: any;
  children: string;
  to: string;
}

const NavItem = ({ icon, children, to, ...rest }: NavItemProps) => {
  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Box
        display="flex"
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'brand.400',
          color: 'white',
        }}
        {...rest}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
        />
        <Text>{children}</Text>
      </Box>
    </Link>
  );
};

const Sidebar = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="nav"
      pos="fixed"
      top="16"
      left="0"
      h="calc(100vh - 4rem)"
      w="60"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      display={{ base: 'none', lg: 'block' }}
    >
      <VStack spacing={4} align="stretch" pt={4}>
        <NavItem icon={FiHome} to="/">
          ダッシュボード
        </NavItem>
        <NavItem icon={FiBox} to="/bihin">
          備品一覧
        </NavItem>
        <NavItem icon={FiTruck} to="/movement">
          移動履歴
        </NavItem>
        <NavItem icon={FiActivity} to="/activity">
          アクティビティ
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;