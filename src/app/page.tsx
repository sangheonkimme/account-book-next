import AccountBook from "@/components/pages/AccountBook";
import { cookies } from "next/headers";
import { Transaction } from "@/types/interface/transaction";

type FetchResult = {
  transactions: Transaction[];
  errorStatus?: number;
};

async function getTransactions(
  accessToken: string | undefined
): Promise<FetchResult> {
  if (!accessToken) {
    return { transactions: [] };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${baseUrl}/account-book`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      const transactions = await response.json();
      return { transactions, errorStatus: undefined };
    }
    console.error(
      "Failed to fetch transactions:",
      response.status,
      response.statusText
    );
    return { transactions: [], errorStatus: response.status };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { transactions: [], errorStatus: 500 }; // Generic server error
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  const { transactions, errorStatus } = await getTransactions(
    accessToken?.value
  );

  return (
    <AccountBook initialTransactions={transactions} errorStatus={errorStatus} />
  );
}
