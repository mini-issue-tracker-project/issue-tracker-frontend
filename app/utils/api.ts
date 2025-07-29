export function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  // 1) Read token from localStorage (only in browser)
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }

  // 2) Merge headers: start with any passed in
  const headers = new Headers(init.headers);
  // Ensure JSON content type
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // Add Bearer token if available
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 3) Execute fetch with merged headers
  return fetch(input, { ...init, headers });
} 