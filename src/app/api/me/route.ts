import { auth } from "@/lib/config/next.auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }
  return Response.json({ user: session.user })
}
