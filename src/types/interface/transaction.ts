export type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "saving";
  classification: "fixed" | "variable";
};
