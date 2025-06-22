import {
  ChevronUp,
  Home,
  Settings,
  Star,
  User2,
  Users,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  //   DropdownMenuLabel,
  //   DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/server";
import Logout from "@/components/Logout";

// Menu items.
const items = [
  {
    title: "Home",
    url: "home",
    icon: Home,
  },
  {
    title: "Visitor",
    url: "#",
    icon: Users,
  },
  {
    title: "Revenue",
    url: "#",
    icon: Wallet,
  },
  {
    title: "Rating",
    url: "#",
    icon: Star,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
];

export async function AppSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: organizations, error: isErorrOrgz } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user?.id);

  const { data: chats, error: isErrorChats } = await supabase
    .from("chats")
    .select("id, title")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={`/organizations/${item.url}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats?.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <a href={`/organizations/chat/${chat.id}`}>
                      <span>{chat.title || "Untitled Chat"}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {chats?.length === 0 && (
                <SidebarMenuItem>
                  <span className="text-muted-foreground text-sm">
                    No conversations yet
                  </span>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  <div>
                    <p>{isErorrOrgz ? user?.email : organizations?.[0].name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <Logout />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
