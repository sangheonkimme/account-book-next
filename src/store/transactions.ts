import { create } from "zustand";
import { Transaction } from "@/types/interface/transaction";
import { apiFetch } from "@/lib/api";
import { toast } from "react-hot-toast";

interface TransactionState {
  transactions: Transaction[];
  editingTransactionId: number | null;
  deletingTransactionId: number | null;
  isModalOpen: boolean;
  newDescription: string;
  newType: Transaction["type"] | null;
  newClassification: Transaction["classification"] | null;
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
  setTransactionsAndUpdateOrder: (transactions: Transaction[]) => Promise<void>;
  setNewDescription: (description: string) => void;
  setNewType: (type: Transaction["type"] | null) => void;
  setNewClassification: (
    classification: Transaction["classification"] | null
  ) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  editingTransactionId: null,
  deletingTransactionId: null,
  isModalOpen: false,
  newDescription: "",
  newType: null,
  newClassification: null,
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
      classification:
        formData.get("classification") as Transaction["classification"],
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
      newClassification: transaction.classification,
    });
  },
  cancelEditing: () => {
    set({
      editingTransactionId: null,
      newDescription: "",
      newType: null,
      newClassification: null,
    });
  },
  updateTransaction: async () => {
    const {
      transactions,
      editingTransactionId,
      newDescription,
      newType,
      newClassification,
    } = get();
    if (!editingTransactionId || !newDescription || !newType || !newClassification)
      return;

    try {
      const updatedTransaction = await apiFetch(
        `/account-book/${editingTransactionId}`,
        {
          method: "PATCH",
          body: {
            description: newDescription,
            type: newType,
            classification: newClassification,
          },
        }
      );
      set({
        transactions: transactions.map((t) =>
          t.id === editingTransactionId ? updatedTransaction : t
        ),
        editingTransactionId: null,
        newDescription: "",
        newType: null,
        newClassification: null,
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
  setTransactionsAndUpdateOrder: async (reorderedTransactions: Transaction[]) => {
    const { transactions } = get(); // Get original transactions for revert
    set({ transactions: reorderedTransactions }); // Optimistic update

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
  },
  setNewDescription: (description) => set({ newDescription: description }),
  setNewType: (type) => set({ newType: type }),
  setNewClassification: (classification) =>
    set({ newClassification: classification }),
}));
