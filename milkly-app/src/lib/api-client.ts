import { createApiClient } from "milkly-shared/api";
import { getApiBaseUrl } from "milkly-shared/constants";

export { parseApiError } from "milkly-shared/api";

export const apiClient = createApiClient(getApiBaseUrl());
