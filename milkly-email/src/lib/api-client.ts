import type { Subscriber, Distribution, Newsletter } from "milkly-shared/types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => ({}));
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as Record<string, unknown>)["error"] === "object" &&
      (body as Record<string, unknown>)["error"] !== null &&
      "message" in ((body as Record<string, unknown>)["error"] as Record<string, unknown>)
        ? String(
            ((body as Record<string, unknown>)["error"] as Record<string, unknown>)["message"]
          )
        : `API request failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  const json: unknown = await response.json();

  if (typeof json !== "object" || json === null || !("data" in json)) {
    throw new Error("Invalid API response: missing data field");
  }

  return (json as Record<string, unknown>)["data"] as T;
}

// ---------------------------------------------------------------------------
// Subscribers
// ---------------------------------------------------------------------------

export interface SubscribersResponse {
  subscribers: Subscriber[];
  counts: { total: number; confirmed: number; unconfirmed: number };
  page: number;
  limit: number;
}

export async function fetchSubscribers(page: number, limit: number): Promise<SubscribersResponse> {
  return apiFetch<SubscribersResponse>(`/subscribers?page=${page}&limit=${limit}`);
}

// ---------------------------------------------------------------------------
// Newsletters (for send page — fetches creator's published newsletters)
// ---------------------------------------------------------------------------

export async function fetchMyNewsletters(): Promise<Newsletter[]> {
  return apiFetch<Newsletter[]>("/newsletters");
}

export async function fetchNewsletter(id: string): Promise<Newsletter> {
  return apiFetch<Newsletter>(`/newsletters/${id}`);
}

// ---------------------------------------------------------------------------
// Distributions
// ---------------------------------------------------------------------------

export interface CreateDistributionResponse {
  id: string;
  status: string;
}

export interface DistributionWithNewsletter extends Distribution {
  newsletter: { id: string; title: string; slug: string };
}

export interface DistributionsResponse {
  distributions: DistributionWithNewsletter[];
  total: number;
  page: number;
  limit: number;
}

export async function createDistribution(newsletterId: string): Promise<CreateDistributionResponse> {
  return apiFetch<CreateDistributionResponse>("/distributions", {
    method: "POST",
    body: JSON.stringify({ newsletterId }),
  });
}

export async function fetchDistribution(id: string): Promise<Distribution & { newsletter: { id: string; title: string; userId: string } }> {
  return apiFetch<Distribution & { newsletter: { id: string; title: string; userId: string } }>(`/distributions/${id}`);
}

export async function fetchDistributions(page: number, limit: number): Promise<DistributionsResponse> {
  return apiFetch<DistributionsResponse>(`/distributions?page=${page}&limit=${limit}`);
}
