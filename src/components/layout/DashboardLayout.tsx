"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

import { ChildProps } from "@/interface";

export function DashboardLayout({ children }: ChildProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <div className="flex flex-1">
        <Sidebar isOpen={isMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Render the children passed to this layout */}
          {children}
        </main>
      </div>
    </div>
  );
}
