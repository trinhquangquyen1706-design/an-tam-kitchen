"use client";

import { Package, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kho thực phẩm
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý toàn bộ thực phẩm trong tủ lạnh và kệ bếp.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/foods/scan">
              <Search className="size-4" />
              Quét mã vạch
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/foods/new">
              <Plus className="size-4" />
              Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Package className="size-8" />
        </div>
        <h2 className="text-xl font-semibold">Kho thực phẩm chi tiết</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Trang này sẽ hiển thị danh sách đầy đủ tất cả thực phẩm với bộ lọc
          nâng cao, phân loại theo ngăn mát / ngăn đông / kệ khô, và tìm kiếm
          theo tên.
        </p>
        <Button asChild className="mt-6 rounded-full" variant="outline">
          <Link href="/dashboard">← Quay lại bảng điều khiển</Link>
        </Button>
      </div>
    </div>
  );
}
