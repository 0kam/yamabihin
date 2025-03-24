import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
  Textarea,
  useToast,
  Heading,
  Text,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Bihin, BihinStatus, Movement } from '../types'
import { createMovement, updateMovement, fetchBihin, movementApi } from '../services/api'

const BIHIN_STATUS: BihinStatus[] = [
  '通常使用可能',
  '要修理',
  '修理中',
  '廃棄予定',
  '廃棄済み',
  '紛失',
  '設置済み'
]

interface MovementFormData {
  when_moved: string
  who_moved: string
  why_moved: string
  where_moved: string
  status_after_moved: BihinStatus
  moved_memo?: string
}

export default function MovementForm() {
  const { bihinId, movementId } = useParams<{ bihinId: string, movementId?: string }>()
  const [bihin, setBihin] = useState<Bihin | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<MovementFormData>()

  useEffect(() => {
    const loadData = async () => {
      if (!bihinId) return

      try {
        setIsLoading(true)
        const [bihinData, movements] = await Promise.all([
          fetchBihin(parseInt(bihinId)),
          movementId ? movementApi.getByBihinId(parseInt(bihinId)) : null
        ])

        setBihin(bihinData)

        // 編集モードの場合、既存のデータを取得
        if (movementId && movements) {
          const movement = movements.find(m => m.id === parseInt(movementId))
          if (movement) {
            reset({
              when_moved: movement.when_moved,
              who_moved: movement.who_moved,
              why_moved: movement.why_moved,
              where_moved: movement.where_moved,
              status_after_moved: movement.status_after_moved,
              moved_memo: movement.moved_memo
            })
          }
        }
      } catch (error) {
        toast({
          title: 'エラー',
          description: '備品情報の取得に失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [bihinId, movementId, reset, navigate, toast])

  const onSubmit = async (data: MovementFormData) => {
    if (!bihinId) return

    try {
      if (movementId) {
        await updateMovement(parseInt(bihinId), parseInt(movementId), {
          ...data,
          who_wrote_this: localStorage.getItem('username') || 'unknown'
        })
        toast({
          title: '更新完了',
          description: '移動履歴を更新しました',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else {
        await createMovement(parseInt(bihinId), {
          ...data,
          who_wrote_this: localStorage.getItem('username') || 'unknown'
        })
        toast({
          title: '登録完了',
          description: '移動履歴を登録しました',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
      navigate('/')
    } catch (error) {
      toast({
        title: 'エラー',
        description: movementId ? '更新に失敗しました' : '登録に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setIsDiscardDialogOpen(true)
    } else {
      navigate('/')
    }
  }

  if (isLoading) {
    return <Container maxW="container.md" py={8}>読み込み中...</Container>
  }

  if (!bihin) {
    return null
  }

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6}>{movementId ? '移動履歴編集' : '移動履歴登録'}</Heading>
      <Box mb={6}>
        <Text><strong>備品タイプ:</strong> {bihin.type}</Text>
        <Text><strong>メーカー:</strong> {bihin.vendor}</Text>
        <Text><strong>製品名:</strong> {bihin.model_name}</Text>
      </Box>
      
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.when_moved}>
            <FormLabel htmlFor="when_moved">移動日</FormLabel>
            <Input
              id="when_moved"
              type="date"
              {...register('when_moved', { required: '移動日は必須です' })}
            />
            <FormErrorMessage>
              {errors.when_moved?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.who_moved}>
            <FormLabel htmlFor="who_moved">移動者</FormLabel>
            <Input
              id="who_moved"
              placeholder="移動者を入力"
              {...register('who_moved', { required: '移動者は必須です' })}
            />
            <FormErrorMessage>
              {errors.who_moved?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.why_moved}>
            <FormLabel htmlFor="why_moved">移動理由</FormLabel>
            <Input
              id="why_moved"
              placeholder="移動理由を入力"
              {...register('why_moved', { required: '移動理由は必須です' })}
            />
            <FormErrorMessage>
              {errors.why_moved?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.where_moved}>
            <FormLabel htmlFor="where_moved">移動先</FormLabel>
            <Input
              id="where_moved"
              placeholder="移動先を入力"
              {...register('where_moved', { required: '移動先は必須です' })}
            />
            <FormErrorMessage>
              {errors.where_moved?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.status_after_moved}>
            <FormLabel htmlFor="status_after_moved">移動後の状態</FormLabel>
            <Select
              id="status_after_moved"
              placeholder="状態を選択"
              {...register('status_after_moved', { required: '移動後の状態は必須です' })}
            >
              {BIHIN_STATUS.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.status_after_moved?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.moved_memo}>
            <FormLabel htmlFor="moved_memo">メモ</FormLabel>
            <Textarea
              id="moved_memo"
              placeholder="備考があれば入力してください"
              {...register('moved_memo')}
            />
            <FormErrorMessage>
              {errors.moved_memo?.message}
            </FormErrorMessage>
          </FormControl>

          <Box display="flex" justifyContent="space-between">
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
            >
              {movementId ? '更新' : '登録'}
            </Button>
            <Button variant="ghost" onClick={handleCancel}>
              キャンセル
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* 変更破棄確認ダイアログ */}
      <AlertDialog
        isOpen={isDiscardDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDiscardDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              変更の破棄
            </AlertDialogHeader>

            <AlertDialogBody>
              変更内容は保存されません。本当にキャンセルしますか？
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDiscardDialogOpen(false)}>
                いいえ
              </Button>
              <Button colorScheme="red" onClick={() => navigate('/')} ml={3}>
                はい
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}