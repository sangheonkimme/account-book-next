"use client";

import { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Container,
  Title,
  Paper,
  Modal,
  Group,
  Button,
  Text,
  Grid,
  Chip,
  Stack,
  Box,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { Transaction } from "@/types/interface/transaction";
import { SummaryCards } from "./account-book/SummaryCards";
import { TransactionForm } from "./account-book/TransactionForm";
import { TransactionTable } from "./account-book/TransactionTable";
import { useTransactionStore } from "@/store/transactions";
import { useAuthStore } from "@/store/auth";

type AccountBookProps = {
  initialTransactions: Transaction[];
  errorStatus?: number;
};

const LOCAL_STORAGE_KEY = "anonymous-transactions";

export default function AccountBook({
  initialTransactions,
  errorStatus,
}: AccountBookProps) {
  const {
    transactions,
    setTransactions,
    isModalOpen,
    closeDeleteModal,
    deleteTransaction,
  } = useTransactionStore();
  const { isLoggedIn, isAuthInitialized } = useAuthStore();
  const { logout } = useAuthStore((s) => s.actions);

  const [dateRange, setDateRange] = useState<any>([
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  ]);

  useEffect(() => {
    if (errorStatus === 401) {
      toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
      logout();
    }
  }, [errorStatus, logout]);

  useEffect(() => {
    if (!isAuthInitialized) return;

    if (isLoggedIn) {
      setTransactions(initialTransactions);
    } else if (!isLoggedIn) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      setTransactions(stored ? JSON.parse(stored) : []);
    }
  }, [isLoggedIn, isAuthInitialized, initialTransactions, setTransactions]);

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoggedIn, isAuthInitialized]);

  const filteredTransactions = useMemo(() => {
    const [start, end] = dateRange;
    console.log("start", start);
    console.log("end", end);

    if (!start || !end) return transactions;

    return transactions.filter((t) => {
      const transactionDate = parseISO(t.date);
      return isWithinInterval(transactionDate, { start, end });
    });
  }, [transactions, dateRange]);

  const fixedTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.classification === "fixed"),
    [filteredTransactions]
  );

  const variableTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.classification === "variable"),
    [filteredTransactions]
  );

  const [selectedMonth, setSelectedMonth] = useState<string | string[]>("");

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    []
  );

  const handleMonthChange = (month: string | string[]) => {
    setSelectedMonth(month);
    if (month) {
      const monthIndex = parseInt(month as string, 10) - 1;
      const year = new Date().getFullYear();
      const start = startOfMonth(new Date(year, monthIndex));
      const end = endOfMonth(new Date(year, monthIndex));
      setDateRange([start, end]);
    }
  };

  useEffect(() => {
    const [start, end] = dateRange;
    if (start && end) {
      const startMonth = start.getMonth();
      const endMonth = end.getMonth();
      const startDay = start.getDate();
      const endOfStartMonth = endOfMonth(start);

      if (
        startMonth === endMonth &&
        startDay === 1 &&
        end.getTime() === endOfStartMonth.getTime()
      ) {
        setSelectedMonth(`${startMonth + 1}월`);
      } else {
        setSelectedMonth("");
      }
    }
  }, [dateRange]);

  console.log("transactions", transactions);
  console.log("filteredTransactions", filteredTransactions);
  console.log("fixedTransactions", fixedTransactions);
  console.log("variableTransactions", variableTransactions);

  return (
    <>
      <Toaster position="top-center" />
      <Container fluid>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2} ta="center" mb="xl">
            가계부
          </Title>

          <SummaryCards />
          <TransactionForm />
        </Paper>

        <Stack mt="xl">
          <Group>
            <DatePickerInput
              type="range"
              label="기간 선택"
              placeholder="날짜 범위를 선택하세요"
              valueFormat="YYYY-MM-DD"
              value={dateRange}
              onChange={setDateRange}
              maw={320}
            />

            <Chip.Group value={selectedMonth} onChange={handleMonthChange}>
              <Group mt="md">
                {months.map((month) => (
                  <Chip key={month} value={month}>
                    {month}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </Group>
        </Stack>

        <Grid mt="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box>
              <Title order={4} mb="md">
                고정 지출/수입
              </Title>
              <TransactionTable transactions={fixedTransactions} />
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box>
              <Title order={4} mb="md">
                변동 지출/수입
              </Title>
              <TransactionTable transactions={variableTransactions} />
            </Box>
          </Grid.Col>
        </Grid>

        <Modal
          opened={isModalOpen}
          onClose={closeDeleteModal}
          title="Confirm Deletion"
        >
          <Text>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={deleteTransaction}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Container>
    </>
  );
}
