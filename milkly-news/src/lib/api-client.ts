import { createApiClient } from "milkly-shared/api";
import { getApiBaseUrl } from "milkly-shared/constants";
import type { Newsletter, User } from "milkly-shared/types";

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
