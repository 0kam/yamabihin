import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Stack,
  useToast,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  Heading,
  Badge,
  Flex,
  IconButton,
  Spacer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Bihin, Movement } from '../types'
import { bihinApi, movementApi, deleteBihin, deleteMovement } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

type SortOption = 'type' | 'latest' | 'oldest'

export default function BihinList() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bihins, setBihins] = useState<Bihin[]>([])
  const [filteredBihins, setFilteredBihins] = useState<Bihin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [movements, setMovements] = useState<Record<number, Movement[]>>({})
  const [selectedBihin, setSelectedBihin] = useState<Bihin | null>(null)
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('type')
  const [isDeleteBihinDialogOpen, setIsDeleteBihinDialogOpen] = useState(false)
  const [isDeleteMovementDialogOpen, setIsDeleteMovementDialogOpen] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  useEffect(() => {
    loadBihins()
  }, [])

  const loadBihins = async () => {
    try {
      const data = await bihinApi.getAll()
      setBihins(data)
      setFilteredBihins(data)

      const movementPromises = data.map(bihin =>
        movementApi.getByBihinId(bihin.id)
      )
      const movementData = await Promise.all(movementPromises)

      const movementMap: Record<number, Movement[]> = {}
      data.forEach((bihin, index) => {
        movementMap[bihin.id] = movementData[index]
      })
      setMovements(movementMap)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '備品一覧の取得に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ログアウトに失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDeleteBihin = async () => {
    if (!selectedBihin) return

    try {
      await deleteBihin(selectedBihin.id)
      toast({
        title: '削除完了',
        description: '備品を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      loadBihins()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDeleteBihinDialogOpen(false)
      setSelectedBihin(null)
    }
  }

  const handleDeleteMovement = async () => {
    if (!selectedBihin || !selectedMovement) return

    try {
      await deleteMovement(selectedBihin.id, selectedMovement.id)
      toast({
        title: '削除完了',
        description: '移動履歴を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      loadBihins()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDeleteMovementDialogOpen(false)
      setSelectedMovement(null)
    }
  }

  const getLatestMovement = (bihinId: number): Movement | null => {
    const bihinMovements = movements[bihinId] || []
    return bihinMovements.sort(
      (a, b) => new Date(b.when_moved).getTime() - new Date(a.when_moved).getTime()
    )[0] || null
  }

  useEffect(() => {
    let sorted = [...bihins]
    
    if (sortOption === 'type') {
      sorted.sort((a, b) => a.type.localeCompare(b.type))
    } else if (sortOption === 'latest') {
      sorted.sort((a, b) => 
        new Date(b.when_wrote_this).getTime() - new Date(a.when_wrote_this).getTime()
      )
    } else if (sortOption === 'oldest') {
      sorted.sort((a, b) => 
        new Date(a.when_wrote_this).getTime() - new Date(b.when_wrote_this).getTime()
      )
    }

    if (searchQuery) {
      sorted = sorted.filter(
        item =>
          item.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredBihins(sorted)
  }, [searchQuery, bihins, sortOption])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const showMovementHistory = (bihin: Bihin) => {
    setSelectedBihin(bihin)
    onOpen()
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* ヘッダー部分 */}
      <Flex mb={8} alignItems="center" backgroundColor="white" p={4} borderRadius="md" boxShadow="sm">
        <Heading size="lg">備品管理システム</Heading>
        <Spacer />
        <Stack direction="row" spacing={4} alignItems="center">
          <Text>
            ログインユーザー: <Badge colorScheme="blue">{user?.username}</Badge>
          </Text>
          <Button colorScheme="gray" onClick={handleLogout}>
            ログアウト
          </Button>
        </Stack>
      </Flex>

      {/* 検索・ソート部分 */}
      <Stack spacing={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={4} flex={1}>
            <Input
              placeholder="検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              width="300px"
            />
            <Select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as SortOption)}
              width="200px"
            >
              <option value="type">タイプ順</option>
              <option value="latest">新しい順</option>
              <option value="oldest">古い順</option>
            </Select>
          </Stack>
          <Button
            as={RouterLink}
            to="/bihin/new"
            colorScheme="blue"
            ml={4}
          >
            新規登録
          </Button>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple" backgroundColor="white">
            <Thead>
              <Tr>
                <Th>タイプ</Th>
                <Th>製品名</Th>
                <Th>メーカー</Th>
                <Th>購入者</Th>
                <Th>購入時期</Th>
                <Th>現在の状態・場所</Th>
                <Th>最終更新者</Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBihins.map(item => {
                const latestMovement = getLatestMovement(item.id)
                return (
                  <Tr key={item.id}>
                    <Td>{item.type}</Td>
                    <Td>{item.model_name}</Td>
                    <Td>{item.vendor}</Td>
                    <Td>{item.who_bought}</Td>
                    <Td>{item.when_bought}</Td>
                    <Td>
                      {latestMovement ? (
                        <Stack>
                          <Badge colorScheme={
                            latestMovement.status_after_moved === '通常使用可能' ? 'green' :
                            latestMovement.status_after_moved === '設置済み' ? 'blue' :
                            latestMovement.status_after_moved === '要修理' ? 'yellow' :
                            latestMovement.status_after_moved === '修理中' ? 'orange' :
                            'red'
                          }>
                            {latestMovement.status_after_moved}
                          </Badge>
                          <Text fontSize="sm">{latestMovement.where_moved}</Text>
                        </Stack>
                      ) : (
                        <Badge>未設定</Badge>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {latestMovement?.who_wrote_this || item.who_wrote_this}
                      </Text>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <IconButton
                          as={RouterLink}
                          to={`/bihin/${item.id}/edit`}
                          icon={<EditIcon />}
                          aria-label="編集"
                          colorScheme="blue"
                          size="sm"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="削除"
                          colorScheme="red"
                          size="sm"
                          onClick={() => {
                            setSelectedBihin(item)
                            setIsDeleteBihinDialogOpen(true)
                          }}
                        />
                        <Button
                          as={RouterLink}
                          to={`/movement/${item.id}`}
                          colorScheme="teal"
                          size="sm"
                        >
                          移動履歴登録
                        </Button>
                        <Button
                          onClick={() => showMovementHistory(item)}
                          colorScheme="gray"
                          size="sm"
                        >
                          移動履歴表示
                        </Button>
                      </Stack>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>
      </Stack>

      {/* 移動履歴モーダル */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>移動履歴</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedBihin && (
              <Stack spacing={4}>
                <Text><strong>製品名:</strong> {selectedBihin.model_name}</Text>
                <Text><strong>メーカー:</strong> {selectedBihin.vendor}</Text>
                <Box mt={4}>
                  <Text fontWeight="bold" mb={2}>移動履歴一覧:</Text>
                  {selectedBihin && movements[selectedBihin.id]?.length > 0 ? (
                    movements[selectedBihin.id]
                      .sort((a, b) => new Date(b.when_moved).getTime() - new Date(a.when_moved).getTime())
                      .map(movement => (
                        <Box key={movement.id} p={4} borderWidth={1} borderRadius="md" mb={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Text><strong>日時:</strong> {formatDate(movement.when_moved)}</Text>
                              <Text><strong>移動者:</strong> {movement.who_moved}</Text>
                              <Text><strong>移動先:</strong> {movement.where_moved}</Text>
                              <Text><strong>理由:</strong> {movement.why_moved}</Text>
                              <Badge mb={2}>
                                {movement.status_after_moved}
                              </Badge>
                              {movement.moved_memo && (
                                <Text><strong>メモ:</strong> {movement.moved_memo}</Text>
                              )}
                              <Text fontSize="sm" color="gray.600" mt={2}>
                                <strong>記録者:</strong> {movement.who_wrote_this}
                              </Text>
                            </Box>
                            <Stack>
                              <IconButton
                                as={RouterLink}
                                to={`/movement/${selectedBihin.id}/edit/${movement.id}`}
                                icon={<EditIcon />}
                                aria-label="編集"
                                colorScheme="blue"
                                size="sm"
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                aria-label="削除"
                                colorScheme="red"
                                size="sm"
                                onClick={() => {
                                  setSelectedMovement(movement)
                                  setIsDeleteMovementDialogOpen(true)
                                }}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      ))
                  ) : (
                    <Text>移動履歴はありません</Text>
                  )}
                </Box>
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 備品削除確認ダイアログ */}
      <AlertDialog
        isOpen={isDeleteBihinDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteBihinDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              備品の削除
            </AlertDialogHeader>

            <AlertDialogBody>
              本当にこの備品を削除しますか？この操作は取り消せません。
              {selectedBihin && (
                <Text mt={2} fontWeight="bold">
                  {selectedBihin.type}: {selectedBihin.model_name}
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteBihinDialogOpen(false)}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={handleDeleteBihin} ml={3}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* 移動履歴削除確認ダイアログ */}
      <AlertDialog
        isOpen={isDeleteMovementDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteMovementDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              移動履歴の削除
            </AlertDialogHeader>

            <AlertDialogBody>
              本当にこの移動履歴を削除しますか？この操作は取り消せません。
              {selectedMovement && (
                <Stack mt={2} spacing={1}>
                  <Text><strong>日時:</strong> {formatDate(selectedMovement.when_moved)}</Text>
                  <Text><strong>移動先:</strong> {selectedMovement.where_moved}</Text>
                  <Text><strong>状態:</strong> {selectedMovement.status_after_moved}</Text>
                </Stack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteMovementDialogOpen(false)}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={handleDeleteMovement} ml={3}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}