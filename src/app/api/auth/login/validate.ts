import * as z from "zod";
import { loginSchema } from "@/lib/validations/auth";

export const login = z.object({
  query: z.object({}),
  body: loginSchema
});