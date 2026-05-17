"use client";

import { differenceInCalendarDays, differenceInHours, format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ClipboardCheck,
  MapPin,
  NotebookText,
  Plus,
  ScanLine,
  Refrigerator,
  SearchCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Suspense, useMemo } from "react";
import type { ComponentType, ReactNode } from "react";
import type { FoodStatus } from "@repo/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  EmptyState,
  FoodStatusBadge,
  getFoodStatusLabel,
  LoadingState,
  SectionCard,
} from "@/components/foundation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventoryList } from "@/hooks/queries/use-inventory-list";
import type { FoodItemViewModel } from "@/lib/api/types";
import { getAuthRequiredHref, useAuthHint } from "@/lib/auth-session";
import {
  useDashboardUIStore,
  matchesDashboardFilter,
  matchesLocationFilter,
  DASHBOARD_FILTER_OPTIONS,
  LOCATION_FILTER_OPTIONS,
  type DashboardFilterValue,
  type LocationFilterValue,
} from "@/lib/stores/dashboard-ui-store";
import { cn } from "@/lib/utils";

const statusPriority: Record<FoodStatus, number> = {
  not_recommended: 0,
  check_before_use: 1,
  use_soon: 2,
  fresh: 3,
};

/**
 * Wrapper component with Suspense boundary for skeleton screen (Pillar 4).
 */
export function DigitalFridgeDashboard() {
  return (
    <section className="scroll-mt-20 bg-card py-12 sm:py-16" id="digital-fridge">
      <Suspense
        fallback={
          <DashboardShell>
            <LoadingState
              description="Đang tải danh sách thực phẩm và trạng thái khuyến nghị."
              title="Đang mở tủ lạnh số"
            />
          </DashboardShell>
        }
      >
        <DashboardContent />
      </Suspense>
    </section>
  );
}

/**
 * Inner component that uses useSuspenseQuery — will suspend while loading.
 * Zustand handles UI filter state; TanStack handles all server state.
 */
function DashboardContent() {
  const { data } = useInventoryList();
  const { items: foods, usingMockFallback } = data;

  // Pillar 4: Zustand for UI state only
  const filter = useDashboardUIStore((s) => s.filter);
  const setFilter = useDashboardUIStore((s) => s.setFilter);
  const locationFilter = useDashboardUIStore((s) => s.locationFilter);
  const setLocationFilter = useDashboardUIStore((s) => s.setLocationFilter);

  const reduceMotion = useReducedMotion();
  const hasAuth = useAuthHint();
  const addFoodHref = getProtectedHref("/foods/new", hasAuth);
  const scanHref = getProtectedHref("/foods/scan", hasAuth);

  const sortedFoods = useMemo(() => {
    return [...foods].sort((a, b) => {
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      return a.expiryDate.getTime() - b.expiryDate.getTime();
    });
  }, [foods]);

  const visibleFoods = useMemo(() => {
    return sortedFoods.filter(
      (food) =>
        matchesDashboardFilter(food.status, filter) &&
        matchesLocationFilter(food.location, locationFilter)
    );
  }, [filter, locationFilter, sortedFoods]);

  const stats = useMemo(() => {
    return {
      total: foods.length,
      useSoon: foods.filter((food) => food.status === "use_soon").length,
      needBuy: 0, // placeholder for shopping list feature
      safe: foods.filter((food) => food.status === "fresh").length,
    };
  }, [foods]);

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Dashboard
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-normal sm:text-4xl">
            Tủ lạnh số của bạn
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Theo dõi thực phẩm đã mở nắp và biết món nào nên dùng trước.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-full px-5 text-base" variant="outline">
            <Link href={scanHref}>
              <ScanLine aria-hidden={true} className="size-4" />
              Quét mã vạch
            </Link>
          </Button>
          <Button asChild className="h-12 rounded-full px-5 text-base">
            <Link href={addFoodHref}>
              <Plus aria-hidden={true} className="size-4" />
              Thêm thực phẩm
            </Link>
          </Button>
        </div>
      </div>

      {usingMockFallback ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Đang hiển thị dữ liệu mẫu. Kết nối internet để đồng bộ dữ liệu mới nhất.
        </div>
      ) : null}

      {/* ═══ STAT CARDS ═══ */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Refrigerator}
          label="Tổng số món"
          value={stats.total}
        />
        <StatCard
          icon={Sparkles}
          label="Nên dùng sớm"
          tone="amber"
          value={stats.useSoon}
        />
        <StatCard
          icon={ShoppingCart}
          label="Cần mua"
          tone="orange"
          value={stats.needBuy}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Trong thời gian khuyến nghị"
          tone="emerald"
          value={stats.safe}
        />
      </div>

      {/* ═══ LOCATION FILTER TABS ═══ */}
      <div className="mt-8">
        <Tabs
          className="w-full"
          onValueChange={(value: string) =>
            setLocationFilter(value as LocationFilterValue)
          }
          value={locationFilter}
        >
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-full bg-muted/50 p-2 sm:w-auto">
            {LOCATION_FILTER_OPTIONS.map((option) => (
              <TabsTrigger
                className="min-h-10 flex-none rounded-full px-4 text-sm font-medium"
                key={option.value}
                value={option.value}
              >
                <span className="mr-1.5">{option.emoji}</span>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <SectionCard
          action={
            <Tabs
              className="w-full sm:w-auto"
              onValueChange={(value: string) =>
                setFilter(value as DashboardFilterValue)
              }
              value={filter}
            >
              <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-full p-2 sm:w-auto">
                {DASHBOARD_FILTER_OPTIONS.map((option) => (
                  <TabsTrigger
                    className="min-h-11 flex-none rounded-full px-5 text-sm font-medium"
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          }
          description="Danh sách được sắp xếp theo mức ưu tiên: không nên để quá lâu, cần kiểm tra, nên dùng sớm, rồi còn ổn."
          eyebrow="Danh sách ưu tiên"
          title="Món nên xem trước hôm nay"
        >
          {foods.length === 0 ? (
            <EmptyState
              description="Khi bạn thêm thực phẩm, các món sẽ xuất hiện trong tủ lạnh số."
              title="Tủ lạnh số đang trống"
            >
              <Button asChild className="mt-4 h-11 rounded-full px-5">
                <Link href={addFoodHref}>
                  <Plus aria-hidden={true} className="size-4" />
                  Thêm thực phẩm đầu tiên
                </Link>
              </Button>
            </EmptyState>
          ) : visibleFoods.length === 0 ? (
            <EmptyState
              description="Không có món nào trong bộ lọc hiện tại."
              title="Không có món phù hợp"
            />
          ) : (
            <div className="grid gap-4">
              {visibleFoods.map((food, index) => (
                <FoodCard
                  food={food}
                  hasAuth={hasAuth}
                  index={index}
                  key={food.id}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <ReminderPreview
          foods={foods}
        />
      </div>

      {/* ═══ FLOATING ACTION BUTTON ═══ */}
      <Link
        href={addFoodHref}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <Plus aria-hidden={true} className="size-5" />
        <span className="hidden sm:inline">Thêm thực phẩm nhanh</span>
      </Link>
    </DashboardShell>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
  tone?: "default" | "amber" | "orange" | "emerald";
}) {
  const toneClassName = {
    default: "bg-accent text-accent-foreground",
    amber: "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    orange: "bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
    emerald: "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  }[tone];

  return (
    <div className="rounded-3xl border bg-background p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            toneClassName
          )}
        >
          <Icon aria-hidden={true} className="size-5" />
        </span>
      </div>
    </div>
  );
}

/**
 * Compute freshness percentage (0-100) based on how much time remains.
 */
function getFreshnessPercent(food: FoodItemViewModel): number {
  const now = new Date();
  const opened = food.openedAt ?? food.createdAt ?? now;
  const totalHours = differenceInHours(food.expiryDate, opened);
  const elapsedHours = differenceInHours(now, opened);

  if (totalHours <= 0) return 0;
  const remaining = Math.max(0, 1 - elapsedHours / totalHours);
  return Math.round(remaining * 100);
}

function FreshnessBar({ percent }: { percent: number }) {
  const color =
    percent > 70
      ? "bg-emerald-500"
      : percent > 30
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

function FoodCard({
  food,
  hasAuth,
  index,
  reduceMotion,
}: {
  food: FoodItemViewModel;
  hasAuth: boolean;
  index: number;
  reduceMotion: boolean | null;
}) {
  const openedLabel = food.openedAt
    ? format(food.openedAt, "dd/MM/yyyy")
    : "Chưa mở nắp";
  const openedDays = food.openedAt
    ? Math.max(0, differenceInCalendarDays(new Date(), food.openedAt))
    : null;
  const detailPath = `/foods/${food.id}`;
  const detailHref = getProtectedHref(detailPath, hasAuth);
  const freshnessPercent = getFreshnessPercent(food);

  return (
    <motion.article
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      className="rounded-3xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
      transition={{
        delay: Math.min(index * 0.04, 0.16),
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold leading-tight">
              {food.displayName}
            </h3>
            <FoodStatusBadge className="w-fit" status={food.status} />
          </div>

          {/* Freshness progress bar */}
          <FreshnessBar percent={freshnessPercent} />
          <p className="mt-1 text-xs text-muted-foreground">
            Độ tươi: {freshnessPercent}% thời gian còn lại
          </p>

          <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <InfoLine
              icon={CalendarDays}
              label="Ngày mở nắp"
              value={openedLabel}
            />
            <InfoLine
              icon={Clock3}
              label="Số ngày đã mở"
              value={openedDays === null ? "Chưa ghi nhận" : `${openedDays} ngày`}
            />
            <InfoLine
              icon={MapPin}
              label="Vị trí bảo quản"
              value={food.locationLabel}
            />
            <InfoLine
              icon={NotebookText}
              label="Ghi chú"
              value={food.notes ?? "Chưa có ghi chú"}
            />
          </div>
        </div>

        <Button asChild className="h-11 rounded-full lg:mt-0" variant="outline">
          <Link href={detailHref}>
            Xem chi tiết
            <ArrowRight aria-hidden={true} className="size-4" />
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}

function getProtectedHref(targetPath: string, hasAuth: boolean) {
  return hasAuth ? targetPath : getAuthRequiredHref(targetPath);
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-background px-3 py-2">
      <Icon aria-hidden={true} className="mt-0.5 size-4 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="block truncate font-medium text-foreground">
          {value}
        </span>
      </span>
    </div>
  );
}

function ReminderPreview({
  foods,
}: {
  foods: FoodItemViewModel[];
}) {
  const priorityFoods = foods.filter((food) => food.status !== "fresh");
  const priorityFood = priorityFoods.sort(
    (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()
  )[0];

  const priorityText = priorityFood
    ? `${priorityFood.displayName} — ${getFoodStatusLabel(priorityFood.status)}`
    : "Hiện chưa có món nào cần ưu tiên trong danh sách.";

  return (
    <aside className="rounded-3xl border bg-background p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles aria-hidden={true} className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-primary">Nhắc nhở</p>
          <h3 className="font-heading text-lg font-semibold">
            Gợi ý hôm nay
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm font-medium">{priorityText}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm font-medium">
            {priorityFoods.length > 0
              ? `Bạn có ${priorityFoods.length} món nên xem trước hôm nay`
              : "Các món còn lại đang ở trạng thái ít cần chú ý hơn"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Nhắc nhở tự động sẽ gửi qua thông báo khi tính năng reminder được kích
        hoạt.
      </p>
    </aside>
  );
}
