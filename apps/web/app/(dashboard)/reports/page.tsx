"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Leaf,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock Analytics Data ───────────────────────────────────

const TOP_WASTED = [
  { name: "Rau thơm các loại", count: 5, percent: 38 },
  { name: "Sữa tươi hữu cơ", count: 3, percent: 23 },
  { name: "Bánh mì sandwich", count: 2, percent: 14 },
];

const MONTHLY_STATS = [
  { month: "Th1", consumed: 74, wasted: 14 },
  { month: "Th2", consumed: 81, wasted: 9 },
  { month: "Th3", consumed: 72, wasted: 16 },
  { month: "Th4", consumed: 85, wasted: 7 },
  { month: "Th5", consumed: 79, wasted: 17 },
];

// ═══════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Báo cáo & Phân tích căn bếp
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi thói quen tiêu thụ và tối ưu chi phí gia đình.
        </p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Dữ liệu minh họa cho demo
        </span>
      </div>

      {/* ═══ TOP SUMMARY CARDS ═══ */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Money saved */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tiền tiết kiệm tháng này
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                +387.200 đ
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" />
                <span>+12.3% so với tháng trước</span>
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
              <BadgeDollarSign className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Waste reduction */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Giảm lãng phí
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                -28.6%
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <TrendingDown className="size-3" />
                <span>So với 3 tháng trước</span>
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
              <Leaf className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total managed */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tổng thực phẩm quản lý
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                183
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Trong 5 tháng sử dụng
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/40">
              <ArrowUpRight className="size-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ANALYTICS GRID ═══ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── LEFT: Financial Impact Card ── */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Phân tích hiệu quả sử dụng
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tỷ lệ tiêu thụ thành công vs lãng phí tháng này
          </p>

          {/* Massive counter */}
          <div className="mt-6 text-center">
            <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
              78.4%
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tỷ lệ tiêu thụ thành công
            </p>
          </div>

          {/* Visual breakdown bar */}
          <div className="mt-6 space-y-3">
            <div className="flex h-8 overflow-hidden rounded-full">
              <div
                className="flex items-center justify-center bg-emerald-500 text-xs font-semibold text-white"
                style={{ width: "78.4%" }}
              >
                78.4%
              </div>
              <div
                className="flex items-center justify-center bg-red-400 text-xs font-semibold text-white"
                style={{ width: "21.6%" }}
              >
                21.6%
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Tiêu thụ thành công</span>
                <span className="font-semibold text-foreground">78.4%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Lãng phí bỏ đi</span>
                <span className="font-semibold text-foreground">21.6%</span>
              </div>
            </div>
          </div>

          {/* Monthly trend mini-bars */}
          <div className="mt-6 border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground">
              Xu hướng 5 tháng gần đây
            </p>
            <div className="mt-3 flex items-end gap-2">
              {MONTHLY_STATS.map((m) => {
                const total = m.consumed + m.wasted;
                const consumedPct = (m.consumed / total) * 100;
                return (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-24 w-full flex-col justify-end overflow-hidden rounded-lg">
                      <div
                        className="bg-emerald-400 dark:bg-emerald-500"
                        style={{ height: `${consumedPct}%` }}
                      />
                      <div
                        className="bg-red-300 dark:bg-red-500"
                        style={{ height: `${100 - consumedPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Top Wasted Items ── */}
        <div className="space-y-6">
          {/* Top wasted items */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="size-5 text-red-500" />
              <h2 className="text-lg font-semibold text-foreground">
                Top thực phẩm hay quá hạn nhất
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Dữ liệu từ 5 tháng sử dụng gần nhất
            </p>

            <div className="mt-5 space-y-4">
              {TOP_WASTED.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {item.count} lần vứt
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Eco impact card */}
          <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm dark:from-emerald-950/30 dark:to-green-950/30">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50">
                <Leaf className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Tác động môi trường
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Cảm ơn bạn đã giúp giảm lãng phí!
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-slate-900/40">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  11.7 kg
                </p>
                <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  CO₂ giảm phát thải
                </p>
              </div>
              <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-slate-900/40">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  7.4 kg
                </p>
                <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  Thực phẩm được cứu
                </p>
              </div>
            </div>
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
