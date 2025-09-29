import { auth } from "@/lib/config/next.auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/my-ui/AppSidebar";
import { SiteHeader } from "@/components/my-ui/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="h-svh h-[calc(100svh-(var(--spacing)*4))] flex grow flex-col overflow-hidden @7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl">
        <SiteHeader showSidebar />
        <div className="overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
