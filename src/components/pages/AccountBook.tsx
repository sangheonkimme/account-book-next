"use client";

import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Container,
  Title,
  Paper,
  Modal,
  Group,
  Button,
  Text,
} from "@mantine/core";
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

  useEffect(() => {
    if (errorStatus === 401) {
      toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  }, [errorStatus]);

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      setTransactions(stored ? JSON.parse(stored) : []);
    } else if (isAuthInitialized && isLoggedIn) {
      setTransactions(initialTransactions);
    }
  }, [isLoggedIn, isAuthInitialized, initialTransactions, setTransactions]);

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoggedIn, isAuthInitialized]);

  return (
    <>
      <Toaster position="top-center" />
      <Container size="lg">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2} ta="center" mb="xl">
            가계부
          </Title>

          <SummaryCards />
          <TransactionForm />
          <TransactionTable />
        </Paper>

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
