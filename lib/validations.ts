import { z } from "zod"

export const searchSchema = z.object({
  query: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  OPENROUTER_API_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

export const destinationSchema = z.object({
  name: z.string(),
  desination: z.string(),
  description: z.string(),
  imageUrl: z.string().url().optional(),
  embedding: z.array(z.number()).optional(),
})
