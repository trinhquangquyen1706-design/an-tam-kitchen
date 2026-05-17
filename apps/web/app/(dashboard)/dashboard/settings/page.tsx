"use client";

import { Settings, Bell, User, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Cài đặt hệ thống
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tùy chỉnh tài khoản, thông báo và cài đặt ứng dụng.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: User,
            title: "Hồ sơ cá nhân",
            desc: "Cập nhật tên, email và ảnh đại diện.",
            color: "bg-blue-500/10 text-blue-600",
          },
          {
            icon: Bell,
            title: "Thông báo",
            desc: "Bật/tắt nhắc nhở hết hạn và gợi ý hàng ngày.",
            color: "bg-amber-500/10 text-amber-600",
          },
          {
            icon: Shield,
            title: "Bảo mật",
            desc: "Đổi mật khẩu và quản lý phiên đăng nhập.",
            color: "bg-emerald-500/10 text-emerald-600",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-start gap-3 rounded-2xl border bg-background p-6 transition hover:shadow-md"
          >
            <div
              className={`flex size-12 items-center justify-center rounded-2xl ${item.color}`}
            >
              <item.icon className="size-5" />
            </div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
            <span className="mt-auto rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Sắp ra mắt
            </span>
          </div>
        ))}
      </div>

      <Button asChild className="rounded-full" variant="outline">
        <Link href="/dashboard">← Quay lại bảng điều khiển</Link>
      </Button>
    </div>
  );
}
