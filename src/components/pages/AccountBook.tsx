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
  LoadingOverlay,
  Select,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { parseISO, isWithinInterval } from "date-fns";
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
    isLoading,
  } = useTransactionStore();
  const { isLoggedIn, isAuthInitialized } = useAuthStore();
  const { logout } = useAuthStore((s) => s.actions);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [payday, setPayday] = useState<string | null>("25");
  const [selectedMonth, setSelectedMonth] = useState<string | string[]>("");

  useEffect(() => {
    if (payday) {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth(); // 0-indexed
      const paydayNumber = parseInt(payday, 10);

      let initialMonth = currentMonth + 1; // 1-indexed

      if (currentDay >= paydayNumber) {
        initialMonth = currentMonth + 2;
      }

      if (initialMonth > 12) {
        initialMonth = 1;
      }

      setSelectedMonth(`${initialMonth}월`);
    }
  }, []);

  const paydayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}일`,
  }));

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

  useEffect(() => {
    if (selectedMonth && payday) {
      const monthIndex = parseInt(selectedMonth as string, 10) - 1;
      const year = new Date().getFullYear();
      const paydayNumber = parseInt(payday, 10);

      const startDate = new Date(year, monthIndex - 1, paydayNumber);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(year, monthIndex, paydayNumber - 1);
      endDate.setHours(23, 59, 59, 999);

      setDateRange([startDate, endDate]);
    }
  }, [selectedMonth, payday]);

  const handleDateChange = (newRange: [Date | null, Date | null]) => {
    if (newRange[0] && newRange[1]) {
      setSelectedMonth(""); // Deselect month chip
    }
    setDateRange(newRange);
  };

  const handleMonthChange = (month: string | string[]) => {
    setSelectedMonth(month);
  };

  const filteredTransactions = useMemo(() => {
    const [start, end] = dateRange;
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

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    []
  );

  return (
    <>
      <LoadingOverlay visible={isLoading} />
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
            <Select
              label="급여일 설정"
              value={payday}
              onChange={setPayday}
              data={paydayOptions}
              maw={120}
            />
            <DatePickerInput
              type="range"
              label="기간 직접 선택"
              placeholder="날짜 범위를 선택하세요"
              valueFormat="YYYY-MM-DD"
              value={dateRange}
              onChange={handleDateChange}
              maw={320}
            />
          </Group>
          <Chip.Group value={selectedMonth} onChange={handleMonthChange}>
            <Group mt="sm">
              <Text size="sm" fw={500}>
                월 선택:
              </Text>
              {months.map((month) => (
                <Chip key={month} value={month}>
                  {month}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
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
          title="삭제 확인"
        >
          <Text>
            정말로 이 거래 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDeleteModal}>
              취소
            </Button>
            <Button color="red" onClick={deleteTransaction}>
              삭제
            </Button>
          </Group>
        </Modal>
      </Container>
    </>
  );
}
