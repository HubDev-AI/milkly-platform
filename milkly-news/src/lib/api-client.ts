import { createApiClient } from "milkly-shared/api";
import { getApiBaseUrl } from "milkly-shared/constants";
import type { Draft, Newsletter, User } from "milkly-shared/types";

export { parseApiError } from "milkly-shared/api";

const apiBaseUrl = typeof window === "undefined"
  ? getApiBaseUrl()
  : ((import.meta.env.VITE_API_URL as string | undefined) ?? getApiBaseUrl());

export const apiClient = createApiClient(apiBaseUrl);

// ---------------------------------------------------------------------------
// Public API response types
// ---------------------------------------------------------------------------

export interface PaginatedNewsletters {
  newsletters: (Newsletter & { user: Pick<User, "id" | "username" | "name" | "image"> })[];
  total: number;
  page: number;
  limit: number;
}

export interface NewsletterWithUser extends Newsletter {
  user: Pick<User, "id" | "username" | "name" | "image">;
}

export interface CreatorProfile {
  creator: Pick<User, "id" | "username" | "name" | "image" | "createdAt">;
  newsletters: Newsletter[];
}

// ---------------------------------------------------------------------------
// Typed public endpoint helpers
// ---------------------------------------------------------------------------

export async function fetchNewsletters(
  page: number,
  limit: number,
): Promise<PaginatedNewsletters> {
  const response = await apiClient.get<PaginatedNewsletters>(
    `/public/newsletters?page=${page}&limit=${limit}`,
  );
  return response.data;
}

export async function fetchNewsletter(
  username: string,
  slug: string,
): Promise<NewsletterWithUser> {
  const response = await apiClient.get<NewsletterWithUser>(
    `/public/newsletters/@${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
  );
  return response.data;
}

export async function fetchCreatorProfile(
  username: string,
): Promise<CreatorProfile> {
  const response = await apiClient.get<CreatorProfile>(
    `/public/creators/@${encodeURIComponent(username)}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Subscription endpoint helpers
// ---------------------------------------------------------------------------

export interface SubscribeResult {
  id: string;
  confirmed: boolean;
}

export interface ConfirmResult {
  confirmed: boolean;
}

export interface UnsubscribeResult {
  unsubscribed: boolean;
}

export async function subscribe(
  email: string,
  creatorId: string,
): Promise<SubscribeResult> {
  const response = await apiClient.post<SubscribeResult>(
    "/public/subscribe",
    { email, creatorId },
  );
  return response.data;
}

export async function confirmSubscription(
  token: string,
): Promise<ConfirmResult> {
  const response = await apiClient.get<ConfirmResult>(
    `/public/confirm/${encodeURIComponent(token)}`,
  );
  return response.data;
}

export async function unsubscribe(
  token: string,
): Promise<UnsubscribeResult> {
  const response = await apiClient.get<UnsubscribeResult>(
    `/public/unsubscribe/${encodeURIComponent(token)}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Authenticated creator endpoint helpers (Story 3-2)
// ---------------------------------------------------------------------------

export async function fetchDrafts(): Promise<Draft[]> {
  const response = await apiClient.get<Draft[]>("/drafts");
  return response.data;
}

export async function publishNewsletter(draftId: string): Promise<Newsletter> {
  const response = await apiClient.post<Newsletter>(
    `/drafts/${encodeURIComponent(draftId)}/publish`,
  );
  return response.data;
}

export async function fetchMyNewsletters(): Promise<Newsletter[]> {
  const response = await apiClient.get<Newsletter[]>("/newsletters");
  return response.data;
}
