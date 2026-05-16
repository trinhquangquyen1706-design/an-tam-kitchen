"use client";

import {
  Filter,
  Plus,
  QrCode,
  Search,
  Refrigerator,
  Sparkles,
  ShoppingCart,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import type { FoodStatus } from "@repo/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/foundation";
import { VisualFoodCard } from "@/components/food/visual-food-card";
import { useInventoryList } from "@/hooks/queries/use-inventory-list";
import { useDeleteInventoryItem } from "@/hooks/mutations/use-delete-inventory-item";
import type { FoodItemViewModel } from "@/lib/api/types";
import { useAuthHint } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { RecipeSuggestions } from "./recipe-suggestions";

const statusPriority: Record<FoodStatus, number> = {
  not_recommended: 0,
  check_before_use: 1,
  use_soon: 2,
  fresh: 3,
};

type LocationFilter = "all" | "fridge" | "freezer" | "room_temp";

const LOCATION_FILTERS: Array<{ value: LocationFilter; label: string; emoji: string }> = [
  { value: "all", label: "Tất cả", emoji: "📦" },
  { value: "fridge", label: "Tủ lạnh", emoji: "🧊" },
  { value: "freezer", label: "Tủ đông", emoji: "❄️" },
  { value: "room_temp", label: "Tủ đồ khô", emoji: "🏠" },
];

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          description="Đang tải danh sách thực phẩm…"
          title="Đang mở tủ lạnh số"
        />
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data } = useInventoryList();
  const { items: foods } = data;
  const deleteItem = useDeleteInventoryItem();
  const hasAuth = useAuthHint();

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");

  const sortedFoods = useMemo(() => {
    return [...foods].sort((a, b) => {
      const p = statusPriority[a.status] - statusPriority[b.status];
      if (p !== 0) return p;
      return a.expiryDate.getTime() - b.expiryDate.getTime();
    });
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return sortedFoods.filter((food) => {
      if (locationFilter !== "all" && food.location !== locationFilter) return false;
      if (search && !food.displayName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [sortedFoods, locationFilter, search]);

  const stats = useMemo(() => ({
    total: foods.length,
    useSoon: foods.filter((f) => f.status === "use_soon").length,
    needBuy: 0,
    safe: foods.filter((f) => f.status === "fresh").length,
  }), [foods]);

  const handleDiscard = (id: string) => {
    if (confirm("Bạn có chắc muốn bỏ món này?")) {
      deleteItem.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Bảng quản lý Tủ lạnh Thông minh
        </h1>
        <p className="mt-1 text-muted-foreground">
          Theo dõi, quản lý và giảm lãng phí thực phẩm trong nhà bếp của bạn.
        </p>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Refrigerator} label="Tổng số món" value={stats.total} />
        <StatCard icon={Sparkles} label="Nên dùng sớm" value={stats.useSoon} tone="amber" />
        <StatCard icon={ShoppingCart} label="Cần mua" value={stats.needBuy} tone="orange" />
        <StatCard icon={ClipboardCheck} label="Trong khuyến nghị" value={stats.safe} tone="emerald" />
      </div>

      {/* ═══ SEARCH + ACTIONS ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-xl pl-10 pr-4"
            placeholder="Tìm kiếm thực phẩm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 rounded-xl gap-2" asChild>
            <Link href={hasAuth ? "/foods/scan" : "/login"}>
              <QrCode className="size-4" />
              Quét hóa đơn
            </Link>
          </Button>
          <Button className="h-11 rounded-xl gap-2" asChild>
            <Link href={hasAuth ? "/foods/new" : "/login"}>
              <Plus className="size-4" />
              Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      {/* ═══ LOCATION FILTER PILLS ═══ */}
      <div className="flex flex-wrap gap-2">
        {LOCATION_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setLocationFilter(f.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              locationFilter === f.value
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* ═══ MAIN GRID + RECIPE SIDEBAR ═══ */}
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        {/* Food Cards Grid */}
        <div>
          {filteredFoods.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-16 text-center">
              <Refrigerator className="size-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">Không có thực phẩm nào</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? "Thử tìm kiếm với từ khóa khác." : "Thêm thực phẩm để bắt đầu quản lý."}
              </p>
              <Button className="mt-4 rounded-xl" asChild>
                <Link href={hasAuth ? "/foods/new" : "/login"}>
                  <Plus className="mr-1 size-4" />
                  Thêm thực phẩm
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
              {filteredFoods.map((food, idx) => (
                <VisualFoodCard
                  key={food.id}
                  id={food.id}
                  name={food.displayName}
                  imageUrl={food.imageUrl}
                  location={food.location}
                  locationLabel={food.locationLabel}
                  status={food.status}
                  openedAt={food.openedAt}
                  expiryDate={food.expiryDate}
                  onDiscard={handleDiscard}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recipe Suggestions Panel */}
        <RecipeSuggestions foods={foods} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "default" | "amber" | "orange" | "emerald";
}) {
  const toneClass = {
    default: "bg-accent text-accent-foreground",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  }[tone];

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <span className={cn("flex size-10 items-center justify-center rounded-xl", toneClass)}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
