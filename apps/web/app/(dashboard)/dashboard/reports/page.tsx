"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Báo cáo thống kê
        </h1>
        <p className="mt-1 text-muted-foreground">
          Phân tích chi tiêu, lãng phí và xu hướng sử dụng thực phẩm.
        </p>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
          <BarChart3 className="size-8" />
        </div>
        <h2 className="text-xl font-semibold">Thống kê & Biểu đồ</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Trang này sẽ hiển thị biểu đồ thống kê về lượng thực phẩm đã sử
          dụng, lãng phí theo tháng, chi phí ước tính và xu hướng tiêu thụ
          của gia đình bạn.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <div className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            📊 Biểu đồ chi tiêu
          </div>
          <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            📉 Tỷ lệ lãng phí
          </div>
          <div className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            📈 Xu hướng tiêu thụ
          </div>
        </div>
        <Button asChild className="mt-6 rounded-full" variant="outline">
          <Link href="/dashboard">← Quay lại bảng điều khiển</Link>
        </Button>
      </div>
    </div>
  );
}
