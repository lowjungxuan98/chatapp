import * as z from "zod";

export const loginSchema = z.object({
  query: z.object({}),
  body: z.object({
    email: z.email(),
    password: z.string().min(1)
  })
});