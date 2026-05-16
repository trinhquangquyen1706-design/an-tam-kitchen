"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChefHat,
  Home,
  LayoutGrid,
  Leaf,
  LogOut,
  Moon,
  ShoppingCart,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/foundation/theme-provider";
import { useAuthHint, clearAuthHint, useAuthUserHint } from "@/lib/auth-session";
import { logout as apiLogout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard", label: "Tổng quan", icon: Home },
  { href: "/dashboard", label: "Kho thực phẩm", icon: LayoutGrid, active: true },
  { href: "#", label: "Danh sách mua sắm", icon: ShoppingCart, comingSoon: true },
  { href: "#", label: "Công thức", icon: BookOpen, comingSoon: true },
  { href: "#", label: "Phân tích", icon: BarChart3, comingSoon: true },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { resolved, toggle } = useTheme();
  const hasAuth = useAuthHint();
  const userHint = useAuthUserHint();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthHint();
      router.push("/");
      router.refresh();
    }
  };

  const displayName = userHint?.name ?? userHint?.email ?? "Người dùng";

  return (
    <div className="flex min-h-dvh bg-background">
      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf aria-hidden className="size-4" />
            </span>
            <span className="font-heading text-base font-bold tracking-tight">
              Bếp An Tâm
            </span>
          </Link>
          <button
            className="ml-auto rounded-lg p-1.5 hover:bg-accent lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active || pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.comingSoon ? "#" : item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  item.comingSoon && "cursor-default opacity-50"
                )}
                onClick={(e) => {
                  if (item.comingSoon) e.preventDefault();
                  setSidebarOpen(false);
                }}
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.comingSoon && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Sắp có
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-xl bg-accent/50 p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ChefHat className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">Đầu bếp gia đình</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 hover:bg-accent lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          <Button
            aria-label={resolved === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            className="size-9 rounded-full"
            onClick={toggle}
            size="icon"
            variant="ghost"
          >
            {resolved === "dark" ? (
              <Sun className="size-[1.1rem]" />
            ) : (
              <Moon className="size-[1.1rem]" />
            )}
          </Button>

          {hasAuth && (
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="h-9 gap-2 rounded-full"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
