import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Heading,
} from '@chakra-ui/react';

const StatCard = ({ title, value, helpText }: { title: string; value: string | number; helpText?: string }) => {
  return (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel fontSize="md">{title}</StatLabel>
          <StatNumber fontSize="2xl">{value}</StatNumber>
          {helpText && <StatHelpText>{helpText}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>ダッシュボード</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="総備品数"
          value={150}
          helpText="登録済みの備品総数"
        />
        <StatCard
          title="利用中"
          value={42}
          helpText="現在利用中の備品数"
        />
        <StatCard
          title="修理中"
          value={3}
          helpText="修理・メンテナンス中"
        />
        <StatCard
          title="今月の移動数"
          value={28}
          helpText="今月の備品移動回数"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={8}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>最近の移動履歴</Heading>
            {/* TODO: Add movement history table */}
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>状態別備品数</Heading>
            {/* TODO: Add status distribution chart */}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;