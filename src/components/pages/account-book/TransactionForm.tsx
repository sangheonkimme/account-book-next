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
  SegmentedControl,
  Input,
} from "@mantine/core";
import { useFormStatus } from "react-dom";
import { useTransactionStore } from "@/store/transactions";
import { useRef } from "react";

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

export function TransactionForm() {
  const { amount, setAmount, addTransaction } = useTransactionStore();
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    await addTransaction(formData);
    formRef.current?.reset();
  };

  return (
    <Paper withBorder shadow="xs" p="xl" mt="xl" radius="md">
      <Title order={3} mb="lg">
        항목 추가
      </Title>
      <Box component="form" ref={formRef} action={handleAction}>
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <TextInput
              name="date"
              label="Date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2.5 }}>
            <Input.Wrapper label="Classification">
              <SegmentedControl
                name="classification"
                data={[
                  { label: "고정", value: "fixed" },
                  { label: "변동", value: "variable" },
                ]}
                defaultValue="variable"
                fullWidth
              />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2.5 }}>
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
          <Grid.Col span={{ base: 12, sm: 6, md: 1.5 }}>
            <Select
              name="type"
              label="Type"
              defaultValue="expense"
              data={["expense", "income", "saving"]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 1.5 }}>
            <SubmitButton />
          </Grid.Col>
        </Grid>
      </Box>
    </Paper>
  );
}
