"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Leaf,
  LogOut,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/foundation/theme-provider";
import { clearAuthHint, useAuthUserHint } from "@/lib/auth-session";
import { logout as apiLogout } from "@/lib/api/auth";

// ─── Sidebar Navigation Items ──────────────────────────────

const navItems = [
  {
    href: "/dashboard",
    label: "Bảng điều khiển",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/inventory",
    label: "Kho thực phẩm",
    icon: Package,
  },
  {
    href: "/dashboard/shopping",
    label: "Danh sách đi chợ",
    icon: ShoppingCart,
  },
  {
    href: "/dashboard/reports",
    label: "Báo cáo thống kê",
    icon: BarChart3,
  },
  {
    href: "/dashboard/settings",
    label: "Cài đặt hệ thống",
    icon: Settings,
  },
];

// ═══════════════════════════════════════════════════════════
// Dashboard Layout
// ═══════════════════════════════════════════════════════════

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { resolved, toggle } = useTheme();
  const userHint = useAuthUserHint();

  const displayName = userHint?.name ?? userHint?.email ?? "Chef An Tâm";

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearAuthHint();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-dvh bg-background">
      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={cn(
          "sticky top-0 z-30 flex h-dvh flex-col border-r bg-[oklch(0.96_0.025_150)] transition-all duration-300 dark:bg-[oklch(0.22_0.03_150)]",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* ── Brand ── */}
        <div className="flex min-h-16 items-center gap-3 border-b px-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Leaf aria-hidden className="size-5" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight text-foreground">
                Bếp An Tâm
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Quản lý thực phẩm đã mở nắp
              </p>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Sidebar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  aria-hidden
                  className={cn("size-5 shrink-0", isActive && "text-primary")}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── Collapse toggle ── */}
        <div className="border-t px-3 py-2">
          <Button
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            className="w-full justify-center rounded-xl"
            onClick={() => setCollapsed(!collapsed)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                <span className="ml-2">Thu gọn</span>
              </>
            )}
          </Button>
        </div>

        {/* ── Footer: Theme + User ── */}
        <div className="space-y-2 border-t p-3">
          {/* Dark mode */}
          <Button
            className={cn("w-full justify-start gap-3 rounded-xl", collapsed && "justify-center")}
            onClick={toggle}
            size="sm"
            type="button"
            variant="ghost"
          >
            {resolved === "dark" ? (
              <Sun aria-hidden className="size-4 shrink-0" />
            ) : (
              <Moon aria-hidden className="size-4 shrink-0" />
            )}
            {!collapsed && (
              <span>{resolved === "dark" ? "Chế độ sáng" : "Chế độ tối"}</span>
            )}
          </Button>

          {/* User info */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-accent/50 p-2.5",
              collapsed && "justify-center"
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserRound className="size-4 text-primary" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  Xin chào,
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {displayName}
                </p>
              </div>
            )}
          </div>

          {/* Logout */}
          <Button
            className={cn("w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive", collapsed && "justify-center")}
            onClick={handleLogout}
            size="sm"
            type="button"
            variant="ghost"
          >
            <LogOut aria-hidden className="size-4 shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </Button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
