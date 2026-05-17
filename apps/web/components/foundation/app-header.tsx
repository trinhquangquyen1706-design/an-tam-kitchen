"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Moon,
  Plus,
  ScanLine,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthHint, clearAuthHint, useAuthUserHint } from "@/lib/auth-session";
import { logout as apiLogout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/foundation/theme-provider";

type AppHeaderProps = {
  className?: string;
};

const navItems = [
  { href: "/dashboard", label: "Tủ lạnh" },
  { href: "/#add-food", label: "Cách hoạt động" },
  { href: "/#features", label: "Tính năng" },
];

const mobileActions = [
  { href: "/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/foods/scan", label: "Quét mã vạch", icon: ScanLine },
  { href: "/foods/new", label: "Thêm thực phẩm", icon: Plus },
];

export function AppHeader({ className }: AppHeaderProps) {
  const hasAuth = useAuthHint();
  const userHint = useAuthUserHint();
  const router = useRouter();
  const { resolved, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75",
        className
      )}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-3 rounded-lg text-foreground outline-none transition hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          href="/"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Leaf aria-hidden="true" className="size-5" />
          </span>
          <span className="grid leading-tight">
            <span className="font-heading text-base font-semibold">
              Bếp An Tâm
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Quản lý thực phẩm đã mở nắp
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <Button asChild key={item.href} size="sm" variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            aria-label={resolved === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            className="size-10 rounded-full"
            onClick={toggle}
            size="icon"
            title={resolved === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            type="button"
            variant="ghost"
          >
            {resolved === "dark" ? (
              <Sun aria-hidden={true} className="size-[1.15rem]" />
            ) : (
              <Moon aria-hidden={true} className="size-[1.15rem]" />
            )}
          </Button>

          {/* Desktop auth area */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {hasAuth ? (
              <>
                <span className="inline-flex h-9 max-w-48 items-center gap-2 rounded-full border bg-background px-3 text-sm text-foreground">
                  <UserRound aria-hidden={true} className="size-4 shrink-0 text-primary" />
                  <span className="hidden text-muted-foreground sm:inline">Xin chào,</span>
                  <span className="truncate font-medium">{displayName}</span>
                </span>
                <Button
                  aria-label="Đăng xuất"
                  onClick={handleLogout}
                  size="sm"
                  title="Đăng xuất"
                  type="button"
                  variant="outline"
                  className="h-10 gap-2 rounded-full px-3"
                >
                  <LogOut aria-hidden={true} className="size-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/signup">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="Mở menu"
                className="size-10 rounded-full md:hidden"
                size="icon"
                type="button"
                variant="ghost"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <Leaf className="size-5 text-primary" />
                  Bếp An Tâm
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1 p-4">
                {/* User info on mobile */}
                {hasAuth && (
                  <div className="mb-3 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <UserRound className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Xin chào,
                      </p>
                      <p className="truncate text-sm font-semibold">
                        {displayName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nav items */}
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}

                {/* Divider */}
                <div className="my-2 h-px bg-border" />

                {/* Quick actions */}
                {hasAuth &&
                  mobileActions.map((action) => (
                    <SheetClose asChild key={action.href}>
                      <Link
                        href={action.href}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                      >
                        <action.icon className="size-4 text-primary" />
                        {action.label}
                      </Link>
                    </SheetClose>
                  ))}

                {/* Auth actions */}
                <div className="mt-auto pt-4">
                  {hasAuth ? (
                    <Button
                      className="h-11 w-full rounded-2xl"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      type="button"
                      variant="outline"
                    >
                      <LogOut className="size-4" />
                      Đăng xuất
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Button asChild className="h-11 rounded-2xl">
                          <Link href="/login">Đăng nhập</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          asChild
                          className="h-11 rounded-2xl"
                          variant="outline"
                        >
                          <Link href="/signup">Đăng ký miễn phí</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
