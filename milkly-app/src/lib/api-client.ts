import { createApiClient } from "milkly-shared/api";

export { parseApiError } from "milkly-shared/api";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const apiClient = createApiClient(apiBaseUrl);
