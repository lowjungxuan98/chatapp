import * as z from "zod";
import { registerSchema as authRegisterSchema } from "@/lib/validations/auth";

export const register = z.object({
  query: z.object({}),
  body: authRegisterSchema
});