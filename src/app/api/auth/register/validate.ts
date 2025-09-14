import * as z from "zod";

export const registerSchema = z.object({
  query: z.object({}),
  body: z.object({
    email: z.email(),
    name: z.string().min(1).max(100),
    password: z.string().min(8)
  })
});