import * as z from "zod";

export const verifyEmail = z.object({
  query: z.object({
    token: z.string().min(1, 'Token is required')
  }),
  body: z.object({})
});