"use client";

import {
  IconBriefcase,
  IconCalendarUser,
  IconCar,
  IconCreditCard,
  IconDashboard,
  IconMapPin,
  IconMessage,
  IconMessages,
  IconSpeakerphone,
  IconNotes,
  IconPackage,
  IconUsersGroup,
} from "@tabler/icons-react";
import * as React from "react";

import logo from "@/assets/logo.png";
import { NavDocuments } from "@/components/nav-documents";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import { getMediaUrl } from "@/lib/utils";

type SidebarUser = { name: string; email: string; avatar: string };

function useCurrentUser(): SidebarUser {
  const [user, setUser] = React.useState<SidebarUser>({ name: "", email: "", avatar: "" });

  React.useEffect(() => {
    let isMounted = true;
    api
      .get("/user/profile")
      .then((res) => {
        const u = res?.data?.data || res?.data;
        if (!u || !isMounted) return;
        setUser({
          name: u.name || "",
          email: u.email || "",
          avatar: u.profilePicture ? getMediaUrl(u.profilePicture) : "",
        });
      })
      .catch(() => {
        // Keep the empty state; NavUser shows initials/placeholders.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return user;
}
import { SidebarFooter } from "@/components/ui/sidebar";

const data = {
  documents: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      name: "User Management",
      url: "/dashboard/chauffeur",
      icon: IconUsersGroup,
    },
    {
      name: "Job Management",
      url: "/dashboard/jobs",
      icon: IconBriefcase,
    },
    {
      name: "Subscriptions",
      url: "/dashboard/subscriptions",
      icon: IconCreditCard,
    },
    {
      name: "Vehicle Configurations",
      url: "/dashboard/vehicle-config",
      icon: IconCar,
    },
    // {
    //   name: "Deals Management",
    //   url: "/dashboard/deals",
    //   icon: IconCalendarUser,
    // },
    {
      name: "Item Management",
      url: "/dashboard/items",
      icon: IconPackage,
    },
    {
      name: "Support",
      url: "/dashboard/support",
      icon: IconMessage,
    },
    {
      name: "Chat Groups",
      url: "/dashboard/chat-groups",
      icon: IconMessages,
    },
    {
      name: "Legal Policy",
      url: "/dashboard/terms-and-condition",
      icon: IconNotes,
    },
    {
      name: "Service Area",
      url: "/dashboard/service-area",
      icon: IconMapPin,
    },
    {
      name: "Broadcast Notifications",
      url: "/dashboard/broadcast-notifications",
      icon: IconSpeakerphone,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useCurrentUser();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton asChild className=" flex items-center border"> */}
            <div className="flex items-center justify-center pb-2">
              <Link
                href="/"
                className="block w-full duration-300  overflow-hidden"
              >
                <Image
                  src={logo}
                  className="w-full h-full"
                  width={300}
                  height={300}
                  alt="Ekkali logo"
                />
              </Link>
            </div>
            {/* </SidebarMenuButton> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
