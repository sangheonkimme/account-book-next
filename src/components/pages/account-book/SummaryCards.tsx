import { Grid, Card, Text } from "@mantine/core";
import { useTransactionStore } from "@/store/transactions";

export function SummaryCards() {
  const transactions = useTransactionStore((state) => state.transactions);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaving = transactions
    .filter((t) => t.type === "saving")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense - totalSaving;

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card withBorder radius="md" padding="xl">
          <Text fz="lg" fw={500}>
            총 수입
          </Text>
          <Text c="teal" fz="xl" fw={700}>
            {totalIncome.toLocaleString()}원
          </Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card withBorder radius="md" padding="xl">
          <Text fz="lg" fw={500}>
            총 지출
          </Text>
          <Text c="red" fz="xl" fw={700}>
            {totalExpense.toLocaleString()}원
          </Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card withBorder radius="md" padding="xl">
          <Text fz="lg" fw={500}>
            총 저축
          </Text>
          <Text c="blue" fz="xl" fw={700}>
            {totalSaving.toLocaleString()}원
          </Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card withBorder radius="md" padding="xl">
          <Text fz="lg" fw={500}>
            잔액
          </Text>
          <Text fz="xl" fw={700}>
            {balance.toLocaleString()}원
          </Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
