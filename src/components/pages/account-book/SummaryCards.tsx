import { Grid, Card, Text } from "@mantine/core";

type SummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  totalSaving: number;
  balance: number;
};

export function SummaryCards({
  totalIncome,
  totalExpense,
  totalSaving,
  balance,
}: SummaryCardsProps) {
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
