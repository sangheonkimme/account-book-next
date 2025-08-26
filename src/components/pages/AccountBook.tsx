'use client';

import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Container,
  Title,
  Paper,
  Modal,
  Group,
  Button,
  Text,
} from '@mantine/core';
import { Transaction } from '@/types/interface/transaction';
import { apiFetch } from '@/lib/api';
import { SummaryCards } from './account-book/SummaryCards';
import { TransactionForm } from './account-book/TransactionForm';
import { TransactionTable } from './account-book/TransactionTable';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuthStore } from '@/store/auth';

type AccountBookProps = {
  initialTransactions: Transaction[];
  session: boolean;
};

const LOCAL_STORAGE_KEY = 'anonymous-transactions';

export default function AccountBook({
  initialTransactions,
  session,
}: AccountBookProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const editingRowRef = useRef<HTMLTableRowElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions
  );
  const [opened, setOpened] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    number | null
  >(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    number | null
  >(null);
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<Transaction['type'] | null>(null);
  const [amount, setAmount] = useState<string | number>('');
  const { isLoggedIn, isAuthInitialized } = useAuthStore();

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      setTransactions(stored ? JSON.parse(stored) : []);
    } else if (isAuthInitialized && isLoggedIn) {
      setTransactions(initialTransactions);
    }
  }, [isLoggedIn, isAuthInitialized, initialTransactions]);

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoggedIn, isAuthInitialized]);

  const handleClickOpen = (id: number) => {
    setDeletingTransactionId(id);
    setOpened(true);
  };

  const handleClose = () => {
    setDeletingTransactionId(null);
    setOpened(false);
  };

  // 등록
  const handleAddTransaction = async (formData: FormData) => {
    const description = formData.get('description') as string;
    const newAmount = Number(amount);

    if (!description.trim() || !newAmount) {
      toast.error('Description and amount are required.');
      return;
    }

    const newTransactionData = {
      id: isLoggedIn ? 0 : Date.now(), // Use timestamp for local ID
      date: formData.get('date') as string,
      description,
      amount: newAmount,
      type: formData.get('type') as 'income' | 'expense' | 'saving',
    };

    if (isLoggedIn) {
      try {
        const result = await apiFetch('/account-book', {
          method: 'POST',
          body: newTransactionData,
        });
        setTransactions([result, ...transactions]);
        toast.success('Transaction added successfully!');
        formRef.current?.reset();
        setAmount('');
      } catch (error) {
        toast.error('Failed to add transaction.');
        console.error(error);
      }
    } else {
      setTransactions([newTransactionData, ...transactions]);
      toast.success('Transaction added successfully!');
      formRef.current?.reset();
      setAmount('');
    }
  };

  // 수정
  const handleUpdateTransaction = async () => {
    if (!editingTransactionId || !newDescription || !newType) return;

    if (isLoggedIn) {
      try {
        const updatedTransaction = await apiFetch(
          `/account-book/${editingTransactionId}`,
          {
            method: 'PATCH',
            body: { description: newDescription, type: newType },
          }
        );
        setTransactions(
          transactions.map((t) =>
            t.id === editingTransactionId ? updatedTransaction : t
          )
        );
        toast.success('Transaction updated successfully!');
      } catch (error) {
        toast.error('Failed to update transaction.');
        console.error(error);
      }
    } else {
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransactionId
            ? { ...t, description: newDescription, type: newType }
            : t
        )
      );
      toast.success('Transaction updated successfully!');
    }

    setEditingTransactionId(null);
    setNewDescription('');
    setNewType(null);
  };

  // 삭제
  const handleDeleteConfirm = async () => {
    if (!deletingTransactionId) return;

    if (isLoggedIn) {
      try {
        await apiFetch(`/account-book/${deletingTransactionId}`, {
          method: 'DELETE',
        });
        setTransactions(
          transactions.filter((t) => t.id !== deletingTransactionId)
        );
        toast.success('Transaction deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete transaction.');
        console.error(error);
      }
    } else {
      setTransactions(
        transactions.filter((t) => t.id !== deletingTransactionId)
      );
      toast.success('Transaction deleted successfully!');
    }

    handleClose();
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setNewDescription(transaction.description);
    setNewType(transaction.type);
  };

  const handleEditKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleUpdateTransaction();
    }
    if (event.key === 'Escape') {
      setEditingTransactionId(null);
      setNewDescription('');
      setNewType(null);
    }
  };

  const handleReorder = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = transactions.findIndex((t) => t.id === active.id);
      const newIndex = transactions.findIndex((t) => t.id === over.id);
      const reorderedTransactions = arrayMove(
        transactions,
        oldIndex,
        newIndex
      );
      setTransactions(reorderedTransactions);

      if (isLoggedIn) {
        try {
          // TODO: Confirm the API endpoint and payload for reordering
          await apiFetch('/api/account-book/reorder', {
            method: 'PATCH',
            body: {
              orderedIds: reorderedTransactions.map((t) => t.id),
            },
          });
          toast.success('Order updated successfully!');
        } catch (error) {
          toast.error('Failed to update order.');
          // Revert to the original order on error
          setTransactions(transactions);
          console.error(error);
        }
      }
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaving = transactions
    .filter((t) => t.type === 'saving')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense - totalSaving;

  return (
    <>
      <Toaster position="top-center" />
      <Container size="lg">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2} ta="center" mb="xl">
            가계부
          </Title>

          <SummaryCards
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalSaving={totalSaving}
            balance={balance}
          />

          <TransactionForm
            formRef={formRef}
            handleAddTransaction={handleAddTransaction}
            amount={amount}
            setAmount={setAmount}
          />

          <TransactionTable
            transactions={transactions}
            editingTransactionId={editingTransactionId}
            newDescription={newDescription}
            newType={newType}
            editingRowRef={editingRowRef}
            handleEditClick={handleEditClick}
            handleEditKeyDown={handleEditKeyDown}
            setNewDescription={setNewDescription}
            setNewType={setNewType}
            handleClickOpen={handleClickOpen}
            handleReorder={handleReorder}
          />
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