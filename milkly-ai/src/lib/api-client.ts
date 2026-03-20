import type { Draft } from "milkly-shared/types";
import { createApiClient } from "milkly-shared/api";

export { parseApiError } from "milkly-shared/api";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const apiClient = createApiClient(apiBaseUrl);

// ---------------------------------------------------------------------------
// AI generation types
// ---------------------------------------------------------------------------

export interface GenerateNewsletterRequest {
  prompt: string;
}

export interface GenerateNewsletterResponse {
  mklySource: string;
  title: string;
  warning?: string | undefined;
}

export interface CreateDraftRequest {
  mklySource: string;
  title: string;
}

// ---------------------------------------------------------------------------
// AI-specific API helpers
// ---------------------------------------------------------------------------

export async function generateNewsletter(
  prompt: string
): Promise<GenerateNewsletterResponse> {
  const result = await apiClient.post<GenerateNewsletterResponse>(
    "/ai/generate-newsletter",
    { prompt } satisfies GenerateNewsletterRequest
  );
  return result.data;
}

export async function createDraft(
  mklySource: string,
  title: string
): Promise<Draft> {
  const result = await apiClient.post<Draft>("/drafts", {
    mklySource,
    title,
  } satisfies CreateDraftRequest);
  return result.data;
}
