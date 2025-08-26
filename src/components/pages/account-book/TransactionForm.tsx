import {
  Box,
  Grid,
  TextInput,
  NumberInput,
  Select,
  Button,
  rem,
  Paper,
  Title,
} from "@mantine/core";
import { useFormStatus } from "react-dom";

type TransactionFormProps = {
  formRef: React.RefObject<HTMLFormElement | null>;
  handleAddTransaction: (formData: FormData) => Promise<void>;
  amount: string | number;
  setAmount: (value: string | number) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      fullWidth
      style={{ height: rem(42) }}
      disabled={pending}
      loading={pending}
    >
      Add
    </Button>
  );
}

export function TransactionForm({
  formRef,
  handleAddTransaction,
  amount,
  setAmount,
}: TransactionFormProps) {
  return (
    <Paper withBorder shadow="xs" p="xl" mt="xl" radius="md">
      <Title order={3} mb="lg">
        항목 추가
      </Title>
      <Box component="form" ref={formRef} action={handleAddTransaction}>
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, sm: 6, md: 2.5 }}>
            <TextInput
              name="date"
              label="Date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <TextInput
              name="description"
              label="Description"
              placeholder="e.g. Lunch"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <NumberInput
              name="amount"
              label="Amount"
              placeholder="e.g. 10000"
              thousandSeparator
              value={amount}
              onChange={setAmount}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Select
              name="type"
              label="Type"
              defaultValue="expense"
              data={["expense", "income", "saving"]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2.5 }}>
            <SubmitButton />
          </Grid.Col>
        </Grid>
      </Box>
    </Paper>
  );
}
