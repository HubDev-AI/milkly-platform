import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),

  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  APPLE_CLIENT_ID: z.string().default(""),
  APPLE_CLIENT_SECRET: z.string().default(""),

  REDIS_URL: z.string().default("redis://localhost:6379"),

  S3_ENDPOINT: z.string().default("http://localhost:9000"),
  S3_BUCKET: z.string().default("milkly-media"),
  S3_ACCESS_KEY: z.string().default("minioadmin"),
  S3_SECRET_KEY: z.string().default("minioadmin"),
  S3_REGION: z.string().default("us-east-1"),

  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().default("noreply@milkly.app"),

  OPENAI_API_KEY: z.string().default(""),
  ANTHROPIC_API_KEY: z.string().default(""),
  GOOGLE_AI_API_KEY: z.string().default(""),

  APP_URL: z.string().default("http://localhost:8000"),
  LANDING_URL: z.string().default("http://localhost:8001"),
  NEWS_URL: z.string().default("http://localhost:8002"),
  AI_URL: z.string().default("http://localhost:8003"),
  EMAIL_URL: z.string().default("http://localhost:8004"),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = EnvSchema.parse(process.env);
