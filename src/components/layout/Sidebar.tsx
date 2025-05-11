"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, Settings, LogOut, Database, Inbox } from "lucide-react";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
}

export function Sidebar({ className, isOpen = true }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      icon: Users,
      label: "Admin Management",
      href: "/dashboard/admin",
    },
    {
      icon: Database,
      label: "Symbol Management",
      href: "/dashboard/symbols",
    },
    {
      icon: Inbox,
      label: "Customer Enquiries",
      href: "/dashboard/enquiry",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <Database className="h-6 w-6" />
          <span>Admin Dashboard</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === route.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <Link href="/login">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-sidebar-accent/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
