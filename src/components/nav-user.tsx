"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/hooks/useAuth";
import {
  ChevronsUpDown,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  const avatarSrc =
    user?.avatar ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop";

  return (
    <div className="w-full">
      {/* Top Separator */}
      <Separator className="mb-2 bg-white/10" />

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="group relative flex w-full items-center gap-3 rounded-xl p-2 text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer outline-none data-[state=open]:bg-white/[0.10]"
              >
                {/* Avatar with Status Dot */}
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 rounded-xl overflow-hidden bg-purple-600">
                    <AvatarImage src={avatarSrc} alt={user?.name || "Admin"} className="object-cover" />
                    <AvatarFallback className="rounded-xl bg-purple-600 text-white font-bold text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online Status Indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-[#0f172a] shadow-xs" />
                </div>

                {/* User Details */}
                <div className="flex flex-1 flex-col text-left leading-tight min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-sm text-white tracking-wide">
                      {user?.name || "Admin"}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-500/25 text-purple-200">
                      Admin
                    </span>
                  </div>
                  <span className="truncate text-xs text-white/50 font-normal mt-0.5">
                    {user?.email || "admin@ekkali.com"}
                  </span>
                </div>

                {/* Chevron Action */}
                <ChevronsUpDown className="size-4 text-white/40 group-hover:text-white/80 transition-colors shrink-0 ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 rounded-2xl p-2 bg-[#0f172a]/95 text-white border border-white/10 shadow-2xl backdrop-blur-xl"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              {/* Top User Profile Header */}
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.05] border border-white/5">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarImage src={avatarSrc} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-purple-600 text-white font-bold text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col text-left min-w-0">
                    <span className="truncate font-semibold text-xs text-white">
                      {user?.name || "Admin User"}
                    </span>
                    <span className="truncate text-[11px] text-white/50">
                      {user?.email || "admin@ekkali.com"}
                    </span>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-300 font-medium">
                      <Sparkles size={10} className="text-purple-400" />
                      <span>Administrator</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1.5 bg-white/10" />

              {/* Single Action: Edit Profile */}
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <User size={14} className="text-purple-400" />
                  <span>Edit Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 bg-white/10" />

              {/* Logout Action */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl cursor-pointer py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 focus:bg-rose-500/15 focus:text-rose-300 transition-colors"
              >
                <LogOut size={14} className="mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
