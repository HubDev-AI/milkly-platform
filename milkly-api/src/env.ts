import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  REDIS_URL: z.string().default("redis://localhost:6379"),

  S3_ENDPOINT: z.string().default("http://localhost:9000"),
  S3_BUCKET: z.string().default("milkly-media"),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),

  // Email
  EMAIL_PROVIDER: z.string().optional().default("resend"),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional().default("Milkly <noreply@milkly.app>"),
  EMAIL_FROM: z.string().default("noreply@milkly.app"),

  // AI Configuration — Base (fallback for tier-specific configs)
  AI_PROVIDER: z.enum(["google", "openai", "anthropic"]).optional(),
  AI_MODEL: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_TEMPERATURE: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return 0.7;
      const num = parseFloat(val);
      return isNaN(num) ? 0.7 : Math.min(2, Math.max(0, num));
    }),

  // AI Configuration — High tier (complex tasks: template generation, content)
  AI_HIGH_PROVIDER: z.enum(["google", "openai", "anthropic"]).optional(),
  AI_HIGH_MODEL: z.string().optional(),
  AI_HIGH_API_KEY: z.string().optional(),

  // AI Configuration — Low tier (simple tasks: notes, keywords)
  AI_LOW_PROVIDER: z.enum(["google", "openai", "anthropic"]).optional(),
  AI_LOW_MODEL: z.string().optional(),
  AI_LOW_API_KEY: z.string().optional(),

  // Provider-specific API keys (fallback when tier key is not set)
  GOOGLE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  APP_URL: z.string().default("http://localhost:8000"),
  LANDING_URL: z.string().default("http://localhost:8001"),
  NEWS_URL: z.string().default("http://localhost:8002"),
  AI_URL: z.string().default("http://localhost:8003"),
  EMAIL_URL: z.string().default("http://localhost:8004"),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = EnvSchema.parse(process.env);

// ---------------------------------------------------------------------------
// AI configuration helpers
// ---------------------------------------------------------------------------

export type AIProvider = "google" | "openai" | "anthropic";

export type AIModelTier = "high" | "low";

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

/** Resolve the provider-specific API key from env */
function getProviderApiKey(provider: AIProvider): string | undefined {
  switch (provider) {
    case "google":
      return env.GOOGLE_API_KEY || env.GOOGLE_AI_API_KEY;
    case "openai":
      return env.OPENAI_API_KEY;
    case "anthropic":
      return env.ANTHROPIC_API_KEY;
    default:
      return undefined;
  }
}

/** Get AI configuration for the "high" tier (complex tasks). Falls back to base config. */
function getHighAIConfig(): AIConfig | null {
  const provider = env.AI_HIGH_PROVIDER ?? env.AI_PROVIDER;
  const model = env.AI_HIGH_MODEL ?? env.AI_MODEL;
  const apiKey =
    env.AI_HIGH_API_KEY ??
    env.AI_API_KEY ??
    (provider ? getProviderApiKey(provider) : undefined);

  if (!provider || !model || !apiKey) return null;
  return { provider, model, apiKey };
}

/** Get AI configuration for the "low" tier (simple tasks). Falls back to base config. */
function getLowAIConfig(): AIConfig | null {
  const provider = env.AI_LOW_PROVIDER ?? env.AI_PROVIDER;
  const model = env.AI_LOW_MODEL ?? env.AI_MODEL;
  const apiKey =
    env.AI_LOW_API_KEY ??
    env.AI_API_KEY ??
    (provider ? getProviderApiKey(provider) : undefined);

  if (!provider || !model || !apiKey) return null;
  return { provider, model, apiKey };
}

/** Get AI configuration for a given tier */
export function getAIConfig(tier: AIModelTier): AIConfig | null {
  return tier === "high" ? getHighAIConfig() : getLowAIConfig();
}
