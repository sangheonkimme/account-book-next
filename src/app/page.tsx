import AccountBook from "@/components/pages/AccountBook";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  let transactions = [];
  if (accessToken) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/account-book`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
        cache: "no-store",
      });

      console.log("response", response);

      if (response.ok) {
        transactions = await response.json();
      } else {
        // Handle non-ok responses if necessary
        console.error("Failed to fetch transactions:", response.statusText);
        transactions = [];
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      transactions = [];
    }
  }

  return (
    <AccountBook initialTransactions={transactions} session={!!accessToken} />
  );
}
