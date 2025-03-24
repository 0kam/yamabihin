import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';

const BihinDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = id === 'new';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    toast({
      title: isNew ? '備品を登録しました' : '備品情報を更新しました',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/bihin');
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        {isNew ? '新規備品登録' : '備品詳細'}
      </Heading>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>管理コード</FormLabel>
                    <Input placeholder="例: PC-001" />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>備品名</FormLabel>
                    <Input placeholder="例: ノートPC" />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>カテゴリ</FormLabel>
                    <Select placeholder="カテゴリを選択">
                      <option value="PC">PC</option>
                      <option value="映像機器">映像機器</option>
                      <option value="事務機器">事務機器</option>
                      <option value="その他">その他</option>
                    </Select>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>状態</FormLabel>
                    <Select placeholder="状態を選択">
                      <option value="利用可能">利用可能</option>
                      <option value="利用中">利用中</option>
                      <option value="修理中">修理中</option>
                      <option value="廃棄">廃棄</option>
                    </Select>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>設置場所</FormLabel>
                    <Input placeholder="例: 開発部" />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>購入日</FormLabel>
                    <Input type="date" />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>備考</FormLabel>
                    <Input placeholder="備考があれば入力してください" />
                  </FormControl>
                </GridItem>
              </Grid>

              <Stack direction="row" spacing={4} justify="flex-end">
                <Button
                  variant="outline"
                  onClick={() => navigate('/bihin')}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                >
                  {isNew ? '登録' : '更新'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default BihinDetail;