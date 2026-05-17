"use client";

import { ShoppingCart, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShoppingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Danh sách đi chợ
          </h1>
          <p className="mt-1 text-muted-foreground">
            Lên kế hoạch mua sắm dựa trên thực phẩm sắp hết.
          </p>
        </div>
        <Button className="w-fit rounded-full">
          <Plus className="size-4" />
          Thêm mục cần mua
        </Button>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <ShoppingCart className="size-8" />
        </div>
        <h2 className="text-xl font-semibold">Danh sách mua sắm thông minh</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Tính năng này sẽ tự động gợi ý thực phẩm cần bổ sung dựa trên các
          món đã hết hạn hoặc đã dùng hết, và cho phép bạn tạo danh sách mua
          sắm riêng.
        </p>
        <Button asChild className="mt-6 rounded-full" variant="outline">
          <Link href="/dashboard">← Quay lại bảng điều khiển</Link>
        </Button>
      </div>
    </div>
  );
}
