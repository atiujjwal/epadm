export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function fetchWithCsrf(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const method = init?.method?.toUpperCase() ?? "GET";
  const mutations = ["POST", "PUT", "PATCH", "DELETE"];

  const headers = new Headers(init?.headers);

  if (mutations.includes(method)) {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) {
      headers.set("x-csrf-token", csrfToken);
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
