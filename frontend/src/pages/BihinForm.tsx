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
  Select,
  Stack,
  Textarea,
  useToast,
  Heading,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { BihinType, Organization, PurchaseDate } from '../types'
import { createBihin, updateBihin, bihinApi } from '../services/api'

const BIHIN_TYPES: BihinType[] = [
  '一眼レフカメラ本体',
  'レンズ',
  '音声レコーダー',
  'トラップカメラ',
  '電池',
  'マイコン',
  'PC周辺機器',
  '記録媒体',
  '気象観測装置',
  'その他'
]

const ORGANIZATIONS: Organization[] = [
  '筑波大学',
  '北海道大学',
  '東邦大学',
  '国環研'
]

// 年の選択肢を生成（現在年から10年前まで）
const YEARS = Array.from(
  { length: 11 },
  (_, i) => new Date().getFullYear() - i
)

// 月の選択肢を生成（1-12月）
const MONTHS = Array.from(
  { length: 12 },
  (_, i) => i + 1
)

interface BihinFormData {
  type: BihinType
  vendor: string
  model_name: string
  who_bought: Organization
  purchase_date: PurchaseDate
  why_bought: string
  bought_memo?: string
}

export default function BihinForm() {
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BihinFormData>()
  const navigate = useNavigate()
  const toast = useToast()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  // 編集モードの場合、既存のデータを取得
  useEffect(() => {
    const loadBihin = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const bihin = await bihinApi.getById(parseInt(id))
        
        // 年月を分解
        const [year, month] = bihin.when_bought.split('-')
        
        reset({
          type: bihin.type,
          vendor: bihin.vendor,
          model_name: bihin.model_name,
          who_bought: bihin.who_bought,
          purchase_date: {
            year: parseInt(year),
            month: parseInt(month)
          },
          why_bought: bihin.why_bought,
          bought_memo: bihin.bought_memo
        })
      } catch (error) {
        toast({
          title: 'エラー',
          description: '備品データの取得に失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadBihin()
  }, [id, reset, navigate, toast])

  const onSubmit = async (data: BihinFormData) => {
    try {
      const { purchase_date, ...rest } = data
      const bihinData = {
        ...rest,
        when_bought: `${purchase_date.year}-${String(purchase_date.month).padStart(2, '0')}`
      }

      if (id) {
        await updateBihin(parseInt(id), bihinData)
        toast({
          title: '更新完了',
          description: '備品情報を更新しました',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else {
        await createBihin(bihinData)
        toast({
          title: '登録完了',
          description: '備品を登録しました',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
      navigate('/')
    } catch (error) {
      toast({
        title: 'エラー',
        description: id ? '更新に失敗しました' : '登録に失敗しました',
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

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6}>{id ? '備品編集' : '備品登録'}</Heading>
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.type}>
            <FormLabel htmlFor="type">備品タイプ</FormLabel>
            <Select
              id="type"
              placeholder="備品タイプを選択"
              {...register('type', { required: '備品タイプは必須です' })}
            >
              {BIHIN_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.type?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.vendor}>
            <FormLabel htmlFor="vendor">メーカー</FormLabel>
            <Input
              id="vendor"
              placeholder="メーカーを入力"
              {...register('vendor', { required: 'メーカーは必須です' })}
            />
            <FormErrorMessage>
              {errors.vendor?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.model_name}>
            <FormLabel htmlFor="model_name">製品名</FormLabel>
            <Input
              id="model_name"
              placeholder="製品名を入力"
              {...register('model_name', { required: '製品名は必須です' })}
            />
            <FormErrorMessage>
              {errors.model_name?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.who_bought}>
            <FormLabel htmlFor="who_bought">購入者</FormLabel>
            <Select
              id="who_bought"
              placeholder="購入者を選択"
              {...register('who_bought', { required: '購入者は必須です' })}
            >
              {ORGANIZATIONS.map(org => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.who_bought?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.purchase_date}>
            <FormLabel>購入時期</FormLabel>
            <HStack spacing={4}>
              <Controller
                name="purchase_date.year"
                control={control}
                rules={{ required: '年は必須です' }}
                render={({ field }) => (
                  <Select
                    placeholder="年を選択"
                    {...field}
                    w="150px"
                  >
                    {YEARS.map(year => (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="purchase_date.month"
                control={control}
                rules={{ required: '月は必須です' }}
                render={({ field }) => (
                  <Select
                    placeholder="月を選択"
                    {...field}
                    w="120px"
                  >
                    {MONTHS.map(month => (
                      <option key={month} value={month}>
                        {month}月
                      </option>
                    ))}
                  </Select>
                )}
              />
            </HStack>
            <FormErrorMessage>
              {errors.purchase_date?.year?.message || errors.purchase_date?.month?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.why_bought}>
            <FormLabel htmlFor="why_bought">購入目的</FormLabel>
            <Input
              id="why_bought"
              placeholder="購入目的を入力"
              {...register('why_bought', { required: '購入目的は必須です' })}
            />
            <FormErrorMessage>
              {errors.why_bought?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.bought_memo}>
            <FormLabel htmlFor="bought_memo">メモ</FormLabel>
            <Textarea
              id="bought_memo"
              placeholder="備考があれば入力してください"
              {...register('bought_memo')}
            />
            <FormErrorMessage>
              {errors.bought_memo?.message}
            </FormErrorMessage>
          </FormControl>

          <Box display="flex" justifyContent="space-between">
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
            >
              {id ? '更新' : '登録'}
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