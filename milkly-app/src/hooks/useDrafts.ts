import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Draft } from "milkly-shared/types";
import { apiClient } from "@/lib/api-client";

const DRAFTS_QUERY_KEY = ["drafts"] as const;

export interface CreateDraftInput {
  mklySource: string;
  title?: string;
  templateId?: string;
}

export interface UpdateDraftInput {
  id: string;
  mklySource?: string;
  title?: string;
}

export interface UseDraftsResult {
  drafts: Draft[];
  createDraft: (input: CreateDraftInput) => Promise<Draft>;
  updateDraft: (input: UpdateDraftInput) => Promise<Draft>;
  isLoading: boolean;
  error: Error | null;
}

export function useDrafts(): UseDraftsResult {
  const queryClient = useQueryClient();

  const draftsQuery = useQuery({
    queryKey: DRAFTS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<Draft[]>("/drafts");
      return response.data;
    },
    retry: (failureCount, error) => {
      // Do not retry on 401 (unauthenticated)
      if (error instanceof Error && error.message.includes("AUTH_REQUIRED")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateDraftInput) => {
      const body: { mklySource: string; title?: string; templateId?: string } =
        { mklySource: input.mklySource };
      if (input.title !== undefined) {
        body.title = input.title;
      }
      if (input.templateId !== undefined) {
        body.templateId = input.templateId;
      }
      const response = await apiClient.post<Draft>("/drafts", body);
      return response.data;
    },
    onSuccess: (newDraft) => {
      queryClient.setQueryData<Draft[]>(DRAFTS_QUERY_KEY, (prev) => {
        const existing = prev ?? [];
        return [newDraft, ...existing];
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateDraftInput) => {
      const body: { mklySource?: string; title?: string } = {};
      if (input.mklySource !== undefined) {
        body.mklySource = input.mklySource;
      }
      if (input.title !== undefined) {
        body.title = input.title;
      }
      const response = await apiClient.put<Draft>(`/drafts/${input.id}`, body);
      return response.data;
    },
    onSuccess: (updatedDraft) => {
      queryClient.setQueryData<Draft[]>(DRAFTS_QUERY_KEY, (prev) => {
        if (!prev) return [updatedDraft];
        return prev.map((d) => (d.id === updatedDraft.id ? updatedDraft : d));
      });
    },
  });

  const createDraft = (input: CreateDraftInput): Promise<Draft> =>
    createMutation.mutateAsync(input);

  const updateDraft = (input: UpdateDraftInput): Promise<Draft> =>
    updateMutation.mutateAsync(input);

  return {
    drafts: draftsQuery.data ?? [],
    createDraft,
    updateDraft,
    isLoading: draftsQuery.isLoading,
    error: draftsQuery.error,
  };
}
