"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/actions/transaction";
import { Toaster, toast } from "react-hot-toast";
import {
  Container,
  Title,
  Box,
  Grid,
  Paper,
  TextInput,
  Button,
  Select,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Group,
  NumberInput,
  Card,
  Text,
  rem,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { Transaction } from "@/types/interface/transaction";

type AccountBookProps = {
  initialTransactions: Transaction[];
  session: boolean;
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

export default function AccountBook({
  initialTransactions,
  session,
}: AccountBookProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [opened, setOpened] = useState(false);
  const [transactionIdToDelete, setTransactionIdToDelete] = useState<
    number | null
  >(null);
  const [editingTransactionId, setEditingTransactionId] = useState<
    number | null
  >(null);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const handleClickOpen = (id: number) => {
    setTransactionIdToDelete(id);
    setOpened(true);
  };

  const handleClose = () => {
    setOpened(false);
    setTransactionIdToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (transactionIdToDelete === null) return;

    if (!session) {
      setTransactions((prev) =>
        prev.filter((t) => t.id !== transactionIdToDelete)
      );
      toast.success("Transaction deleted successfully.");
      handleClose();
      return;
    }

    const result = await deleteTransaction(transactionIdToDelete);
    if (!result?.success) {
      toast.error(result?.message || "An unknown error occurred.");
      handleClose();
      return;
    }

    toast.success(result.message);
    handleClose();
  };

  const handleAddTransaction = async (formData: FormData) => {
    if (!session) {
      const newTransaction: Transaction = {
        id: Date.now(),
        date: formData.get("date") as string,
        description: formData.get("description") as string,
        amount: Number(formData.get("amount")),
        type: formData.get("type") as "income" | "expense",
      };
      setTransactions((prev) => [newTransaction, ...prev]);
      toast.success("Transaction added successfully.");
      formRef.current?.reset();
      return;
    }

    const result = await addTransaction(formData);
    if (!result?.success) {
      toast.error(result?.message || "An unknown error occurred.");
      return;
    }

    toast.success(result.message);
    formRef.current?.reset();
  };

  const handleUpdateTransaction = async () => {
    if (editingTransactionId === null) return;

    if (!session) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransactionId
            ? { ...t, description: newDescription }
            : t
        )
      );
      toast.success("Transaction updated successfully.");
      setEditingTransactionId(null);
      setNewDescription("");
      return;
    }

    const result = await updateTransaction(
      editingTransactionId,
      newDescription
    );

    if (!result?.success) {
      toast.error(result?.message || "An unknown error occurred.");
      setEditingTransactionId(null);
      setNewDescription("");
      return;
    }

    toast.success(result.message);
    if (result.data && result.data.length > 0) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransactionId ? (result.data[0] as Transaction) : t
        )
      );
    }
    setEditingTransactionId(null);
    setNewDescription("");
  };

  const handleDescriptionClick = (id: number, description: string) => {
    setEditingTransactionId(id);
    setNewDescription(description);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewDescription(event.currentTarget.value);
  };

  const handleDescriptionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleUpdateTransaction();
    }
    if (event.key === "Escape") {
      setEditingTransactionId(null);
      setNewDescription("");
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const rows = transactions.map((t) => (
    <Table.Tr key={t.id}>
      <Table.Td>{t.date}</Table.Td>
      <Table.Td onClick={() => handleDescriptionClick(t.id, t.description)}>
        {editingTransactionId === t.id ? (
          <TextInput
            value={newDescription}
            onChange={handleDescriptionChange}
            onKeyDown={handleDescriptionKeyDown}
            autoFocus
          />
        ) : (
          t.description
        )}
      </Table.Td>
      <Table.Td align="right">
        <Text c={t.type === "income" ? "teal" : "red"} fw={500}>
          {t.type === "income" ? "+" : "-"}
          {t.amount.toLocaleString()}원
        </Text>
      </Table.Td>
      <Table.Td align="center">
        <Badge color={t.type === "income" ? "teal" : "red"} variant="light">
          {t.type}
        </Badge>
      </Table.Td>
      <Table.Td align="center">
        <ActionIcon color="red" onClick={() => handleClickOpen(t.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Toaster position="top-center" />
      <Container size="lg">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2} ta="center" mb="xl">
            가계부
          </Title>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="md" padding="xl">
                <Text fz="lg" fw={500}>
                  총 수입
                </Text>
                <Text c="teal" fz="xl" fw={700}>
                  {totalIncome.toLocaleString()}원
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="md" padding="xl">
                <Text fz="lg" fw={500}>
                  총 지출
                </Text>
                <Text c="red" fz="xl" fw={700}>
                  {totalExpense.toLocaleString()}원
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
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
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                  <Select
                    name="type"
                    label="Type"
                    defaultValue="expense"
                    data={["expense", "income"]}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 2.5 }}>
                  <SubmitButton />
                </Grid.Col>
              </Grid>
            </Box>
          </Paper>

          <Paper withBorder shadow="xs" p="xl" mt="xl" radius="md">
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th ta="right">Amount</Table.Th>
                  <Table.Th ta="center">Type</Table.Th>
                  <Table.Th ta="center">Delete</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Paper>
        </Paper>

        <Modal opened={opened} onClose={handleClose} title="Confirm Deletion">
          <Text>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Container>
    </>
  );
}
