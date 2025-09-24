import { create } from "zustand";
import { Transaction } from "@/types/interface/transaction";
import { apiFetch, updateAccountBook, deleteAccountBook } from "@/lib/api";
import { toast } from "react-hot-toast";

interface TransactionState {
  transactions: Transaction[];
  editingTransactionId: number | null;
  deletingTransactionId: number | null;
  isModalOpen: boolean;
  isLoading: boolean;
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
  updateTransactionField: (id: number, data: Partial<Transaction>) => Promise<void>;
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
  isLoading: false,
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
      toast.error("내용과 금액을 입력해주세요.");
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

    set({ isLoading: true });
    try {
      const result = await apiFetch("/account-book", {
        method: "POST",
        body: newTransactionData,
      });
      set({ transactions: [result, ...transactions], amount: "" });
      toast.success("거래 내역이 추가되었습니다.");
    } catch (error) {
      toast.error("거래 내역 추가에 실패했습니다.");
      console.error(error);
    } finally {
      set({ isLoading: false });
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

    set({ isLoading: true });
    try {
      const body = {
        description: newDescription,
        type: newType,
        classification: newClassification,
      };
      await updateAccountBook(editingTransactionId, body);

      set({
        transactions: transactions.map((t) =>
          t.id === editingTransactionId ? { ...t, ...body } : t
        ),
        editingTransactionId: null,
        newDescription: "",
        newType: null,
        newClassification: null,
      });
      toast.success("거래 내역이 업데이트되었습니다.");
    } catch (error) {
    } finally {
      set({ isLoading: false });
    }
  },
  updateTransactionField: async (id: number, data: Partial<Transaction>) => {
    const { transactions } = get();
    set({ isLoading: true });
    try {
      // Ensure amount is a number if it's being updated
      if (data.amount) {
        data.amount = Number(data.amount);
      }

      await updateAccountBook(id, data);

      const newTransactions = transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      );
      set({ transactions: newTransactions });
      toast.success("거래 내역이 업데이트되었습니다.");
    } catch (error) {
      toast.error("거래 내역 업데이트에 실패했습니다.");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  openDeleteModal: (id) =>
    set({ deletingTransactionId: id, isModalOpen: true }),
  closeDeleteModal: () =>
    set({ deletingTransactionId: null, isModalOpen: false }),
  deleteTransaction: async () => {
    const { transactions, deletingTransactionId } = get();
    if (!deletingTransactionId) return;

    set({ isLoading: true });
    try {
      await deleteAccountBook(deletingTransactionId);
      set({
        transactions: transactions.filter(
          (t) => t.id !== deletingTransactionId
        ),
        deletingTransactionId: null,
        isModalOpen: false,
      });
      toast.success("거래 내역이 삭제되었습니다.");
    } catch (error) {
      toast.error("거래 내역 삭제에 실패했습니다.");
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  setTransactionsAndUpdateOrder: async (reorderedTransactions: Transaction[]) => {
    const { transactions } = get(); // Get original transactions for revert
    set({ transactions: reorderedTransactions }); // Optimistic update

    set({ isLoading: true });
    try {
      await apiFetch("/account-book/reorder", {
        method: "PATCH",
        body: {
          orderedIds: reorderedTransactions.map((t) => t.id),
        },
      });
      toast.success("순서가 업데이트되었습니다.");
    } catch (error) {
      toast.error("순서 업데이트에 실패했습니다.");
      set({ transactions }); // Revert on error
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  setNewDescription: (description) => set({ newDescription: description }),
  setNewType: (type) => set({ newType: type }),
  setNewClassification: (classification) =>
    set({ newClassification: classification }),
}));
