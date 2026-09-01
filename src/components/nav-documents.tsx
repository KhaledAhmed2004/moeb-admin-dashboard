"use client";

import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const pathName = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            className={cn(
              "mb-2 duration-300 transition-all",
              pathName === item.url
                ? "bg-primary rounded-lg text-primary-foreground shadow-md"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg duration-300"
            )}
            key={item.name}
          >
            <SidebarMenuButton className="py-5 hover:bg-transparent" asChild>
              <Link href={item.url}>
                <div className="w-7">
                  <item.icon size={22} />
                </div>
                <span className="text-[16px]">{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
