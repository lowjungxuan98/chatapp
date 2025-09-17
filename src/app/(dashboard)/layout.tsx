import { auth } from "@/lib/config/next.auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/my-ui/AppSidebar";
import { SiteHeader } from "@/components/my-ui/SiteHeader";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <SidebarProvider defaultOpen>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <main className="flex flex-1 flex-col gap-4 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
