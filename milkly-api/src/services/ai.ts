/**
 * AI Service
 *
 * Multi-provider AI gateway supporting Google (Gemini), OpenAI, and Anthropic.
 * Uses a two-tier model system (HIGH for complex tasks, LOW for simple tasks)
 * with fallback chains: TIER → BASE → provider-specific keys.
 */

import { env, getAIConfig, type AIProvider, type AIModelTier } from "../env.js";
import { AppError, ErrorCode } from "milkly-shared/errors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CallAIOptions {
  modelTier?: AIModelTier;
  temperature?: number;
}

interface GoogleAIResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  error?: {
    message: string;
  };
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AI_ENDPOINTS: Record<AIProvider, string> = {
  google: "https://generativelanguage.googleapis.com/v1beta/models",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
};

const DEFAULT_TEMPERATURE = 0.7;
const ANTHROPIC_MAX_TOKENS = 4096;
const ANTHROPIC_VERSION = "2023-06-01";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Check whether AI is configured for a specific tier (or any tier). */
export function isAIConfigured(tier?: AIModelTier): boolean {
  if (tier) {
    return getAIConfig(tier) !== null;
  }
  return getAIConfig("high") !== null || getAIConfig("low") !== null;
}

/**
 * Call an AI provider with the given prompt.
 *
 * @param prompt   - The text prompt to send.
 * @param options  - Tier selection and temperature override.
 *                   For backward compatibility, a bare number is treated as temperature.
 */
export async function callAI(
  prompt: string,
  options?: CallAIOptions | number,
): Promise<string> {
  const opts: CallAIOptions =
    typeof options === "number" ? { temperature: options } : (options ?? {});

  const tier = opts.modelTier ?? "high";
  const config = getAIConfig(tier);

  if (!config) {
    throw new AppError(
      ErrorCode.AI_GENERATION_FAILED,
      `AI configuration not available for tier: ${tier}`,
    );
  }

  const { provider, model, apiKey } = config;
  const temperature = opts.temperature ?? env.AI_TEMPERATURE ?? DEFAULT_TEMPERATURE;
  const endpoint = AI_ENDPOINTS[provider];

  switch (provider) {
    case "google":
      return callGoogle(endpoint, model, apiKey, prompt, temperature);
    case "openai":
      return callOpenAI(endpoint, model, apiKey, prompt, temperature);
    case "anthropic":
      return callAnthropic(endpoint, model, apiKey, prompt, temperature);
    default: {
      const _exhaustive: never = provider;
      throw new AppError(
        ErrorCode.AI_GENERATION_FAILED,
        `Unsupported AI provider: ${_exhaustive}`,
      );
    }
  }
}

/** Remove markdown code-fence wrappers from AI responses. */
export function cleanMarkdownBlocks(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/```(?:json|html)?\n?/g, "")
      .replace(/```$/g, "")
      .trim();
  }
  return cleaned;
}

// ---------------------------------------------------------------------------
// Provider implementations
// ---------------------------------------------------------------------------

async function callGoogle(
  baseEndpoint: string,
  model: string,
  apiKey: string,
  prompt: string,
  temperature: number,
): Promise<string> {
  const url = `${baseEndpoint}/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature },
    }),
  });

  if (!response.ok) {
    return handleHttpError(response, "Google");
  }

  const data = (await response.json()) as GoogleAIResponse;

  if (data.error) {
    throw new AppError(ErrorCode.AI_GENERATION_FAILED, data.error.message);
  }

  if (data.promptFeedback?.blockReason) {
    throw new AppError(
      ErrorCode.AI_GENERATION_FAILED,
      `AI blocked the prompt: ${data.promptFeedback.blockReason}`,
    );
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new AppError(
      ErrorCode.AI_GENERATION_FAILED,
      "AI returned no response - possibly blocked by safety filters",
    );
  }

  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    throw new AppError(
      ErrorCode.AI_GENERATION_FAILED,
      `AI response blocked: ${candidate.finishReason}`,
    );
  }

  const text = candidate.content?.parts?.[0]?.text ?? "";
  if (!text) {
    throw new AppError(ErrorCode.AI_GENERATION_FAILED, "AI returned empty response");
  }

  return text;
}

async function callOpenAI(
  baseEndpoint: string,
  model: string,
  apiKey: string,
  prompt: string,
  temperature: number,
): Promise<string> {
  const url = `${baseEndpoint}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
    }),
  });

  if (!response.ok) {
    return handleHttpError(response, "OpenAI");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(
  baseEndpoint: string,
  model: string,
  apiKey: string,
  prompt: string,
  temperature: number,
): Promise<string> {
  const url = `${baseEndpoint}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
      temperature,
    }),
  });

  if (!response.ok) {
    return handleHttpError(response, "Anthropic");
  }

  const data = (await response.json()) as {
    content?: Array<{ text?: string }>;
  };

  return data.content?.[0]?.text ?? "";
}

// ---------------------------------------------------------------------------
// Shared error handling
// ---------------------------------------------------------------------------

async function handleHttpError(response: Response, providerName: string): Promise<never> {
  const errorText = await response.text();
  console.error(`[AI] ${providerName} API error: status=${response.status}, body=${errorText}`);

  if (response.status === 429) {
    throw new AppError(
      ErrorCode.RATE_LIMITED,
      "AI service is busy. Please try again in a few moments.",
    );
  }

  throw new AppError(
    ErrorCode.AI_GENERATION_FAILED,
    `AI service (${providerName}) is temporarily unavailable. Please try again later.`,
  );
}
