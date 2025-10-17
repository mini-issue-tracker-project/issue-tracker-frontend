// Helper function to get the full API URL
function getApiUrl(path: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // If path already starts with http/https, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine backend URL with path
  return `${backendUrl}/${cleanPath}`;
}

export function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  // 1) Convert input to full URL if it's a relative path
  let url: string;
  if (typeof input === 'string') {
    url = getApiUrl(input);
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    url = getApiUrl(input.url);
  }

  // 2) Read token from localStorage (only in browser)
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }

  // 3) Merge headers: start with any passed in
  const headers = new Headers(init.headers);
  // Ensure JSON content type
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // Add Bearer token if available
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 4) Execute fetch with full URL and merged headers
  return fetch(url, { ...init, headers });
}

// Helper function for non-authenticated requests (login, register, etc.)
export function apiFetch(path: string, init: RequestInit = {}) {
  const url = getApiUrl(path);
  const headers = new Headers(init.headers);
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  return fetch(url, { ...init, headers });
} 