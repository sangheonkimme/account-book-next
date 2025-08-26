import { getCookie } from "cookies-next";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function apiFetch(url: string, options: any = {}) {
  try {
    const token = getCookie("accessToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(baseUrl + url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : null,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        typeof errorData.error === "string"
          ? errorData.error
          : JSON.stringify(errorData.error) || "API request failed"
      );
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}
