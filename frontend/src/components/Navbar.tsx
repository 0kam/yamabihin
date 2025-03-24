import {
  Box,
  Flex,
  Heading,
  IconButton,
  useColorModeValue,
  Spacer,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="nav"
      position="fixed"
      w="100%"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      zIndex="sticky"
    >
      <Flex px={4} h={16} alignItems="center" maxW="container.xl" mx="auto">
        <IconButton
          aria-label="Menu"
          icon={<HamburgerIcon />}
          size="md"
          variant="ghost"
          display={{ base: 'inline-flex', lg: 'none' }}
        />
        
        <Heading size="md" ml={2}>
          備品管理システム
        </Heading>

        <Spacer />

        <Menu>
          <MenuButton>
            <Avatar size="sm" />
          </MenuButton>
          <MenuList>
            <MenuItem>プロフィール</MenuItem>
            <MenuItem>ログアウト</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default Navbar;