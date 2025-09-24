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
      추가
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
              label="날짜"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2.5 }}>
            <Input.Wrapper label="구분">
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
              label="내용"
              placeholder="예: 점심 식사"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <NumberInput
              name="amount"
              label="금액"
              placeholder="예: 10000"
              thousandSeparator
              min={0}
              step={100}
              value={amount}
              onChange={setAmount}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 1.5 }}>
            <Select
              name="type"
              label="유형"
              defaultValue="expense"
              data={[
                { value: "expense", label: "지출" },
                { value: "income", label: "수입" },
                { value: "saving", label: "저축" },
              ]}
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
