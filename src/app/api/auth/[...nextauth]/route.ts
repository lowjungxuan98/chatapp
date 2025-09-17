// Ensure Node.js runtime for Prisma
export const runtime = "nodejs"

// Re-export Auth.js handlers (exposes /api/auth/* endpoints incl. /session, /csrf, provider callbacks)
import { handlers } from "@/lib/config/next.auth"
export const GET = handlers.GET
export const POST = handlers.POST
