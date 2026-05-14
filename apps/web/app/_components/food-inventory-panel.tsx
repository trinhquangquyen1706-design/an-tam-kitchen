"use client";

import { Suspense } from "react";
import { FoodStatusBadge, LoadingState } from "@/components/foundation";
import { useInventoryList } from "@/hooks/queries/use-inventory-list";

export function FoodInventoryPanel() {
  return (
    <Suspense
      fallback={<LoadingState description="Đang tải danh sách thực phẩm." />}
    >
      <FoodInventoryPanelContent />
    </Suspense>
  );
}

function FoodInventoryPanelContent() {
  const { data } = useInventoryList();
  const { items: foods, usingMockFallback } = data;

  return (
    <div className="rounded-lg border border-[#e7ecdf] bg-white p-5 text-[#1d271f]">
      {usingMockFallback ? (
        <div className="mb-4 rounded-md border border-[#dfe9d0] bg-[#f7faf2] px-4 py-3 text-sm text-[#526055]">
          Đang hiển thị dữ liệu mẫu. Kết nối internet để đồng bộ dữ liệu mới nhất.
        </div>
      ) : null}

      <div className="max-h-[500px] overflow-y-auto pr-2 divide-y divide-[#edf1e8] custom-scrollbar">
        {foods.map((food) => (
          <div
            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
            key={food.id}
          >
            <div>
              <p className="text-lg font-semibold">{food.displayName}</p>
              <p className="mt-1 text-sm text-[#657062]">
                {food.locationLabel}
                {food.quantity ? ` · ${food.quantity}` : ""}
              </p>
            </div>
            <FoodStatusBadge status={food.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
