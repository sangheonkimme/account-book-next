import { getCookie } from "cookies-next";
import { Transaction } from "@/types/interface/transaction";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Function to refresh the access token
const refreshAuthToken = async () => {
  try {
    // The backend's /refresh endpoint is expected to handle the refreshToken cookie
    // and issue a new accessToken cookie.
    const res = await fetch(baseUrl + "/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // If refresh fails, the user should be logged out.
      // This can be handled by the calling function catching the error.
      throw new Error("Failed to refresh token");
    }
    // The new access token is expected to be set in the cookies by the server.
    return true;
  } catch (error) {
    console.error("Token refresh error:", error);
    // Potentially trigger a logout action here
    return false;
  }
};

// options 타입 정의 (fetch API 옵션과 비슷하게)
interface ApiFetchOptions extends RequestInit {
  body?: any; // JSON.stringify를 직접 해주기 때문에 any 허용
}

export async function apiFetch<T = any>(
  url: string,
  options: ApiFetchOptions = {},
  isRetry: boolean = false
): Promise<T | null> {
  try {
    const token = getCookie("accessToken");

    // headers 타입 안전하게 처리
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(baseUrl + url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined, // null 대신 undefined
    });

    if (!response.ok) {
      if (response.status === 401 && !isRetry) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          // Retry the request with the new token
          return apiFetch(url, options, true);
        }
      }

      let errorMessage = "API request failed";
      try {
        const errorData = await response.json();
        errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : JSON.stringify(errorData.error);
      } catch {
        // JSON 파싱 실패 시 그냥 statusText 사용
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    // No content
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return null;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

export const updateAccountBook = async (
  id: number,
  data: Partial<Transaction>
) => {
  return apiFetch(`/account-book/${id}`, {
    method: "PATCH",
    body: data,
  });
};

export const deleteAccountBook = async (id: number) => {
  return apiFetch(`/account-book/${id}`, {
    method: "DELETE",
  });
};
