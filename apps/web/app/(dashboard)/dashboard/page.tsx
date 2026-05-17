"use client";

import { useState, useMemo, Suspense } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VisualFoodCard,
  type VisualFoodItem,
  type FoodCardStatus,
} from "@/components/food/visual-food-card";
import { LoadingState } from "@/components/foundation";
import { useDeleteInventoryItem } from "@/hooks/mutations/use-delete-inventory-item";
import { useInventoryList } from "@/hooks/queries/use-inventory-list";
import type { FoodItemViewModel } from "@/lib/api/types";

// ─── Mock data for the 8 visual items ──────────────────────

const MOCK_VISUAL_FOODS: VisualFoodItem[] = [
  {
    id: "mock-milk",
    name: "Sữa tươi nguyên chất",
    quantity: "Số lượng: 1.5 Lít",
    imageSrc: "/images/foods/milk.png",
    expiryDate: new Date(Date.now() + 7 * 86400000),
    status: "fresh",
  },
  {
    id: "mock-eggs",
    name: "Trứng gà ta",
    quantity: "Số lượng: 10 quả",
    imageSrc: "/images/foods/eggs.png",
    expiryDate: new Date(Date.now() + 14 * 86400000),
    status: "fresh",
  },
  {
    id: "mock-spinach",
    name: "Rau cải bó xôi",
    quantity: "Số lượng: 2 bó",
    imageSrc: "/images/foods/spinach.png",
    expiryDate: new Date(Date.now() + 2 * 86400000),
    status: "nearing",
  },
  {
    id: "mock-cheese",
    name: "Phô mai Cheddar",
    quantity: "Số lượng: 1 miếng",
    imageSrc: "/images/foods/cheese.png",
    expiryDate: new Date(Date.now() + 21 * 86400000),
    status: "fresh",
  },
  {
    id: "mock-avocado",
    name: "Bơ sáp",
    quantity: "Số lượng: 4 quả",
    imageSrc: "/images/foods/avocado.png",
    expiryDate: new Date(Date.now() + 1 * 86400000),
    status: "nearing",
  },
  {
    id: "mock-chicken",
    name: "Ức gà tươi",
    quantity: "Số lượng: 1.5 kg",
    imageSrc: "/images/foods/chicken.png",
    expiryDate: new Date(Date.now() - 1 * 86400000),
    status: "expired",
  },
  {
    id: "mock-peppers",
    name: "Ớt chuông hỗn hợp",
    quantity: "Số lượng: 5 quả",
    imageSrc: "/images/foods/peppers.png",
    expiryDate: new Date(Date.now() + 5 * 86400000),
    status: "fresh",
  },
  {
    id: "mock-yogurt",
    name: "Sữa chua Hy Lạp",
    quantity: "Số lượng: 4 hộp",
    imageSrc: "/images/foods/yogurt.png",
    expiryDate: new Date(Date.now() - 2 * 86400000),
    status: "expired",
  },
];

// ─── Category/sort options ─────────────────────────────────

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "fresh", label: "Tươi ngon" },
  { value: "nearing", label: "Sắp hết hạn" },
  { value: "expired", label: "Đã quá hạn" },
];

const SORT_OPTIONS = [
  { value: "freshness", label: "Độ tươi (gần hết trước)" },
  { value: "name", label: "Tên A → Z" },
  { value: "newest", label: "Mới thêm gần đây" },
];

// ─── Food image mapping by category + name ─────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  milk: "/images/foods/milk.png",
  eggs: "/images/foods/eggs.png",
  sauce: "/images/foods/sauce.png",
  sausage: "/images/foods/sausage.png",
  canned_food: "/images/foods/canned.png",
  drink: "/images/foods/drink.png",
  other: "/images/foods/other.png",
};

/** Name-based keywords → specific image for better visual matching */
const NAME_IMAGE_RULES: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["sữa tươi", "sữa bò", "milk"], image: "/images/foods/milk.png" },
  { keywords: ["sữa chua", "yogurt", "yaourt"], image: "/images/foods/yogurt.png" },
  { keywords: ["trứng", "egg"], image: "/images/foods/eggs.png" },
  { keywords: ["phô mai", "cheese", "cheddar"], image: "/images/foods/cheese.png" },
  { keywords: ["bơ", "avocado"], image: "/images/foods/avocado.png" },
  { keywords: ["gà", "chicken", "ức gà"], image: "/images/foods/chicken.png" },
  { keywords: ["ớt", "pepper", "chuông"], image: "/images/foods/peppers.png" },
  { keywords: ["rau", "cải", "spinach", "xà lách"], image: "/images/foods/spinach.png" },
  { keywords: ["xúc xích", "sausage", "giò"], image: "/images/foods/sausage.png" },
  { keywords: ["tương", "nước mắm", "sauce", "ketchup"], image: "/images/foods/sauce.png" },
  { keywords: ["nước", "trà", "cà phê", "drink", "juice"], image: "/images/foods/drink.png" },
  { keywords: ["đồ hộp", "canned", "lon"], image: "/images/foods/canned.png" },
];

function getFoodImage(name: string, category?: string): string {
  const lowerName = name.toLowerCase();

  // 1. Try name-based matching first (most accurate)
  for (const rule of NAME_IMAGE_RULES) {
    if (rule.keywords.some((kw) => lowerName.includes(kw))) {
      return rule.image;
    }
  }

  // 2. Fall back to category-based mapping
  if (category && CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category];
  }

  // 3. Default fallback
  return "/images/foods/other.png";
}

function mapViewModelToVisualItem(item: FoodItemViewModel): VisualFoodItem {
  const now = new Date();
  const daysLeft = Math.ceil(
    (item.expiryDate.getTime() - now.getTime()) / 86400000
  );

  let status: FoodCardStatus = "fresh";
  if (daysLeft < 0) status = "expired";
  else if (daysLeft <= 3) status = "nearing";

  return {
    id: item.id,
    name: item.displayName,
    quantity: item.quantity || `Phân loại: ${item.categoryLabel}`,
    imageSrc: getFoodImage(item.displayName, item.category ?? undefined),
    expiryDate: item.expiryDate,
    status,
  };
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <LoadingState
            title="Đang tải bảng điều khiển"
            description="Đang tải dữ liệu tủ lạnh số..."
          />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data } = useInventoryList();
  const deleteMutation = useDeleteInventoryItem();

  // Map real data to visual items, fall back to mock visual items if empty
  const realItems = useMemo(
    () => data.items.map(mapViewModelToVisualItem),
    [data.items]
  );
  const allFoods = realItems.length > 0 ? realItems : MOCK_VISUAL_FOODS;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("freshness");

  // ─── Filter & sort ──────────────────────────
  const filteredFoods = useMemo(() => {
    let items = [...allFoods];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.quantity.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter((i) => i.status === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case "freshness":
        items.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
        break;
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
      case "newest":
        items.sort((a, b) => b.expiryDate.getTime() - a.expiryDate.getTime());
        break;
    }

    return items;
  }, [allFoods, searchQuery, categoryFilter, sortBy]);

  // ─── KPI Stats ──────────────────────────────
  const stats = useMemo(() => {
    const expiring = allFoods.filter(
      (f) => f.status === "nearing" || f.status === "expired"
    );
    const expired = allFoods.filter((f) => f.status === "expired");
    // Estimate waste: expired items × average price ~35,000đ
    const wasteEstimate = expired.length * 35000;

    return {
      expiringCount: expiring.length,
      expiringNames: expiring
        .slice(0, 3)
        .map((f) => f.name)
        .join(", "),
      totalCount: allFoods.length,
      categoryCount: new Set(allFoods.map((f) => f.status)).size,
      wasteValue: wasteEstimate,
    };
  }, [allFoods]);

  // ─── Handlers ───────────────────────────────
  const handleEat = (id: string) => {
    const item = allFoods.find((f) => f.id === id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Đã sử dụng "${item?.name ?? "thực phẩm"}"`, {
          description: "Đã xóa khỏi tủ lạnh số.",
        });
      },
    });
  };

  const handleDiscard = (id: string) => {
    const item = allFoods.find((f) => f.id === id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.info(`Đã bỏ "${item?.name ?? "thực phẩm"}"`, {
          description: "Hãy cố gắng giảm lãng phí thực phẩm nhé!",
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Bảng điều khiển tủ lạnh
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý thực phẩm, theo dõi hạn sử dụng và giảm lãng phí.
          </p>
        </div>
        <Button asChild className="h-11 rounded-2xl px-6 text-base shadow-md">
          <Link href="/foods/new">
            <Plus aria-hidden className="size-4" />
            Thêm thực phẩm
          </Link>
        </Button>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Expiring warning */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-5 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Thực phẩm sắp hết hạn
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">
                {stats.expiringCount}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {stats.expiringNames || "Không có"}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40">
              <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Total items */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-5 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tổng số thực phẩm
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">
                {stats.totalCount}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Thuộc {stats.categoryCount} nhóm trạng thái
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
              <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Estimated waste (replaces IoT temperature) */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-5 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, delay: 0.16 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ước tính lãng phí
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">
                {stats.wasteValue.toLocaleString("vi-VN")} đ
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Giá trị đồ quá hạn tháng này
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/40">
              <BadgeDollarSign className="size-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ SEARCH & FILTER ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="h-11 rounded-xl pl-10"
            placeholder="Tìm kiếm thực phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-48">
            <SelectValue placeholder="Lọc theo danh mục" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-52">
            <SelectValue placeholder="Sắp xếp theo độ tươi" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ═══ FOOD CARD GRID ═══ */}
      {filteredFoods.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border bg-muted/20 text-center">
          <Search className="size-10 text-muted-foreground/30" />
          <p className="mt-4 font-medium text-foreground">
            Không tìm thấy thực phẩm
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFoods.map((item, i) => (
            <VisualFoodCard
              key={item.id}
              index={i}
              item={item}
              onEat={handleEat}
              onDiscard={handleDiscard}
            />
          ))}
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
        Copyright © {new Date().getFullYear()} Bếp An Tâm. All rights reserved.
      </footer>
    </div>
  );
}
