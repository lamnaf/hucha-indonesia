import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { config } from "@/config/env";
import { prisma } from "@/infrastructure/database/prisma";

export const auth = betterAuth({
  appName: "HuCha Indonesia",
  baseURL: config.betterAuthUrl || config.appUrl,
  secret: config.betterAuthSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    disableSignUp: true,
    minPasswordLength: 10,
    maxPasswordLength: 100,
  },
  user: {
    modelName: "user",
  },
  session: {
    expiresIn: 60 * 60,
    updateAge: 15 * 60,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  advanced: {
    database: {
      generateId: "serial",
    },
  },
  trustedOrigins: [config.appUrl, config.betterAuthUrl].filter(Boolean),
});
