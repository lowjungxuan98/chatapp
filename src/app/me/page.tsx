// app/me/page.tsx
import { auth, signOut } from "@/lib/config/next.auth"
import { redirect } from "next/navigation"

export default async function MePage() {
    const session = await auth()
    if (!session?.user) {
        // not signed in → send to your login page
        redirect("/login")
    }

    // Server Action to sign out
    async function signOutAction() {
        "use server"
        await signOut({ redirectTo: "/login" })
    }

    const u = session.user as { id?: string; name?: string | null; email?: string | null; image?: string | null }

    return (
        <main className="p-6 bg-white dark:bg-gray-900 min-h-screen">

            <div className="font-mono bg-[#f6f8fa] dark:bg-gray-800 border border-[#eaeef2] dark:border-gray-700 rounded-lg p-3 text-gray-800 dark:text-gray-100 break-words">
                {JSON.stringify(u, null, 2)}
            </div>

            <form action={signOutAction} className="mt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition
                    "
                >
                    Sign out
                </button>
            </form>
        </main>
    )
}