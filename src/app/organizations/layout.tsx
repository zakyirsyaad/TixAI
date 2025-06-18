import { AppSidebar } from "@/components/layout/business/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full max-w-7xl mx-auto p-6">{children}</div>
    </SidebarProvider>
  );
}
