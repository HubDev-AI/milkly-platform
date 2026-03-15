import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma.js";
import { env } from "./env.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.APP_URL, env.NEWS_URL, env.EMAIL_URL, env.AI_URL, env.LANDING_URL],
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: !!env.GOOGLE_CLIENT_ID,
    },
    apple: {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET,
      enabled: !!env.APPLE_CLIENT_ID,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        if (env.NODE_ENV === "development") {
          console.log(`[DEV OTP] ${email}: ${otp}`);
          return;
        }
        // Production: send via Resend (implemented in Story 4-1)
      },
      otpLength: 6,
      expiresIn: 600,
    }),
  ],
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  advanced: {
    crossSubDomainCookies: { enabled: false },
  },
});
