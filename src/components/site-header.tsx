"use client"
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { IconBell } from "@tabler/icons-react";
import { User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const notifications: any = { data: [1, 2, 3] }; // Mock data for indicator

  return (
    <header className="flex h-[100px] shrink-0 items-center gap-2 bg-background border-b-0 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[100px]">
      <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1 text-black" />
          {pathname === "/dashboard" && (
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Admin 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your platform today.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center text-primary hover:bg-gray-50 transition-colors">
                  {notifications?.data?.length > 0 && (
                    <div className="w-4 h-4 rounded-full bg-primary absolute -top-1 -right-1 border-2 border-white flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold">{notifications?.data?.length}</span>
                    </div>
                  )}
                  <IconBell size={20} />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <div className="px-2 py-2">
                <h4 className="font-bold text-lg">Notifications</h4>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar className="w-10 h-10 border shadow-sm cursor-pointer border-primary">
            <AvatarImage src="https://i.ibb.co.com/VWkMFBWM/pngtree-user-icon-png-image-1796659.jpg" />
            <AvatarFallback className="bg-primary text-white">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
