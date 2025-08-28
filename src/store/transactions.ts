import { create } from "zustand";
import { Transaction } from "@/types/interface/transaction";
import { apiFetch } from "@/lib/api";
import { toast } from "react-hot-toast";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

interface TransactionState {
  transactions: Transaction[];
  editingTransactionId: number | null;
  deletingTransactionId: number | null;
  isModalOpen: boolean;
  newDescription: string;
  newType: Transaction["type"] | null;
  amount: string | number;
  setTransactions: (transactions: Transaction[]) => void;
  setAmount: (amount: string | number) => void;
  addTransaction: (formData: FormData) => Promise<void>;
  startEditing: (transaction: Transaction) => void;
  cancelEditing: () => void;
  updateTransaction: () => Promise<void>;
  openDeleteModal: (id: number) => void;
  closeDeleteModal: () => void;
  deleteTransaction: () => Promise<void>;
  handleReorder: (event: DragEndEvent) => Promise<void>;
  setNewDescription: (description: string) => void;
  setNewType: (type: Transaction["type"] | null) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  editingTransactionId: null,
  deletingTransactionId: null,
  isModalOpen: false,
  newDescription: "",
  newType: null,
  amount: "",
  setTransactions: (transactions) => set({ transactions }),
  setAmount: (amount) => set({ amount }),
  addTransaction: async (formData: FormData) => {
    const { transactions, amount } = get();
    const description = formData.get("description") as string;
    const newAmount = Number(amount);

    if (!description.trim() || !newAmount) {
      toast.error("Description and amount are required.");
      return;
    }

    const newTransactionData = {
      id: 0, // Temp ID
      date: formData.get("date") as string,
      description,
      amount: newAmount,
      type: formData.get("type") as Transaction["type"],
    };

    try {
      const result = await apiFetch("/account-book", {
        method: "POST",
        body: newTransactionData,
      });
      set({ transactions: [result, ...transactions], amount: "" });
      toast.success("Transaction added successfully!");
    } catch (error) {
      toast.error("Failed to add transaction.");
      console.error(error);
    }
  },
  startEditing: (transaction) => {
    set({
      editingTransactionId: transaction.id,
      newDescription: transaction.description,
      newType: transaction.type,
    });
  },
  cancelEditing: () => {
    set({ editingTransactionId: null, newDescription: "", newType: null });
  },
  updateTransaction: async () => {
    const { transactions, editingTransactionId, newDescription, newType } =
      get();
    if (!editingTransactionId || !newDescription || !newType) return;

    try {
      const updatedTransaction = await apiFetch(
        `/account-book/${editingTransactionId}`,
        {
          method: "PATCH",
          body: { description: newDescription, type: newType },
        }
      );
      set({
        transactions: transactions.map((t) =>
          t.id === editingTransactionId ? updatedTransaction : t
        ),
        editingTransactionId: null,
        newDescription: "",
        newType: null,
      });
      toast.success("Transaction updated successfully!");
    } catch (error) {
      toast.error("Failed to update transaction.");
      console.error(error);
    }
  },
  openDeleteModal: (id) =>
    set({ deletingTransactionId: id, isModalOpen: true }),
  closeDeleteModal: () =>
    set({ deletingTransactionId: null, isModalOpen: false }),
  deleteTransaction: async () => {
    const { transactions, deletingTransactionId } = get();
    if (!deletingTransactionId) return;

    try {
      await apiFetch(`/account-book/${deletingTransactionId}`, {
        method: "DELETE",
      });
      set({
        transactions: transactions.filter(
          (t) => t.id !== deletingTransactionId
        ),
        deletingTransactionId: null,
        isModalOpen: false,
      });
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction.");
      console.error(error);
    }
  },
  handleReorder: async (event: DragEndEvent) => {
    const { active, over } = event;
    const { transactions } = get();

    if (over && active.id !== over.id) {
      const oldIndex = transactions.findIndex((t) => t.id === active.id);
      const newIndex = transactions.findIndex((t) => t.id === over.id);
      const reorderedTransactions = arrayMove(transactions, oldIndex, newIndex);
      set({ transactions: reorderedTransactions });

      try {
        await apiFetch("/account-book/reorder", {
          method: "PATCH",
          body: {
            orderedIds: reorderedTransactions.map((t) => t.id),
          },
        });
        toast.success("Order updated successfully!");
      } catch (error) {
        toast.error("Failed to update order.");
        set({ transactions }); // Revert on error
        console.error(error);
      }
    }
  },
  setNewDescription: (description) => set({ newDescription: description }),
  setNewType: (type) => set({ newType: type }),
}));
