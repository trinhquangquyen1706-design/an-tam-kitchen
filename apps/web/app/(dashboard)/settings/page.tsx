"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  MessageCircle,
  Plus,
  Shield,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Toggle Component ──────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          checked
            ? "bg-primary"
            : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

// ─── Family Members Mock Data ──────────────────────────────

const FAMILY_MEMBERS = [
  { id: "1", name: "Bố An Tâm", role: "Quản trị viên", avatar: "👨" },
  { id: "2", name: "Mẹ An Tâm", role: "Thành viên", avatar: "👩" },
];

// ═══════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════

export default function SettingsPage() {
  // Toggle states
  const [notifyExpiry, setNotifyExpiry] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyZalo, setNotifyZalo] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [darkReminder, setDarkReminder] = useState(true);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Cài đặt hệ thống
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cấu hình tần suất thông báo và kết nối gia đình.
        </p>
      </div>

      {/* ═══ CARD 1: NOTIFICATIONS ═══ */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b p-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
            <Bell className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Thông báo nhắc nhở
            </h2>
            <p className="text-sm text-muted-foreground">
              Quản lý cách bạn nhận thông báo từ Bếp An Tâm
            </p>
          </div>
        </div>

        <div className="divide-y px-5">
          <Toggle
            checked={notifyExpiry}
            onChange={setNotifyExpiry}
            label="Nhắc nhở trước khi thực phẩm hết hạn 1 ngày"
            description="Gửi thông báo đẩy khi có thực phẩm cần sử dụng gấp."
          />
          <Toggle
            checked={notifyWeekly}
            onChange={setNotifyWeekly}
            label="Gửi báo cáo lãng phí hằng tuần"
            description="Tổng hợp chi phí lãng phí và gợi ý cải thiện mỗi Chủ Nhật."
          />
          <Toggle
            checked={darkReminder}
            onChange={setDarkReminder}
            label="Nhắc nhở buổi tối kiểm tra tủ lạnh"
            description="Mỗi tối lúc 20:00 — nhắc bạn kiểm tra thực phẩm đã mở."
          />
        </div>

        {/* Channels */}
        <div className="border-t px-5 py-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Kênh nhận thông báo
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setNotifyEmail(!notifyEmail)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                notifyEmail
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 text-muted-foreground hover:border-slate-300 dark:border-slate-700"
              )}
            >
              <Mail className="size-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setNotifyZalo(!notifyZalo)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                notifyZalo
                  ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                  : "border-slate-200 text-muted-foreground hover:border-slate-300 dark:border-slate-700"
              )}
            >
              <MessageCircle className="size-4" />
              Zalo
            </button>
          </div>
        </div>
      </div>

      {/* ═══ CARD 2: FAMILY SHARING ═══ */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b p-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
            <Users className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Chia sẻ gia đình
            </h2>
            <p className="text-sm text-muted-foreground">
              Kết nối các thành viên để cùng quản lý tủ lạnh
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* Connected members */}
          <div className="space-y-3">
            {FAMILY_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-xl border bg-background p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-accent text-2xl">
                  {member.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    member.role === "Quản trị viên"
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-100 text-muted-foreground dark:bg-slate-800"
                  )}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          {/* Invite button */}
          <Button
            className="mt-4 w-full rounded-xl"
            variant="outline"
          >
            <UserPlus className="size-4" />
            + Mời thành viên mới
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Mời tối đa 5 thành viên gia đình để cùng quản lý tủ lạnh
          </p>
        </div>
      </div>

      {/* ═══ CARD 3: ACCOUNT SECURITY ═══ */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b p-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
            <Shield className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Bảo mật tài khoản
            </h2>
            <p className="text-sm text-muted-foreground">
              Quản lý mật khẩu và phiên đăng nhập
            </p>
          </div>
        </div>

        <div className="divide-y px-5">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-foreground">Đổi mật khẩu</p>
              <p className="text-sm text-muted-foreground">
                Cập nhật lần cuối: 2 tuần trước
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg">
              Thay đổi
            </Button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-foreground">Phiên đăng nhập</p>
              <p className="text-sm text-muted-foreground">
                Hiện có 2 thiết bị đang hoạt động
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg">
              Quản lý
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
        Copyright © {new Date().getFullYear()} Bếp An Tâm. All rights reserved.
      </footer>
    </div>
  );
}
