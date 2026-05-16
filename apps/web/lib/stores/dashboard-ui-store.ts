/**
 * Pillar 4: Dashboard UI Store (Zustand)
 *
 * Zustand chỉ quản lý UI state thuần túy.
 * Server state (foods, products) do TanStack Query nắm 100%.
 */

import { create } from "zustand";
import type { FoodStatus } from "@repo/types";

export type DashboardFilterValue = "all" | "use_soon" | "check" | "safe";
export type LocationFilterValue = "all" | "fridge" | "freezer" | "room_temp";

export const DASHBOARD_FILTER_OPTIONS: Array<{
  value: DashboardFilterValue;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "use_soon", label: "Nên dùng sớm" },
  { value: "check", label: "Cần kiểm tra" },
  { value: "safe", label: "Trong mốc khuyến nghị" },
];

export const LOCATION_FILTER_OPTIONS: Array<{
  value: LocationFilterValue;
  label: string;
  emoji: string;
}> = [
  { value: "all", label: "Tất cả", emoji: "📦" },
  { value: "fridge", label: "Ngăn mát", emoji: "🧊" },
  { value: "freezer", label: "Ngăn đông", emoji: "❄️" },
  { value: "room_temp", label: "Kệ khô", emoji: "🏠" },
];

type DashboardUIState = {
  /** Active food status filter on the dashboard */
  filter: DashboardFilterValue;
  setFilter: (filter: DashboardFilterValue) => void;

  /** Active location filter */
  locationFilter: LocationFilterValue;
  setLocationFilter: (filter: LocationFilterValue) => void;

  /** Detail modal state — null when closed */
  selectedFoodId: string | null;
  openFoodDetail: (id: string) => void;
  closeFoodDetail: () => void;
};

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),

  locationFilter: "all",
  setLocationFilter: (locationFilter) => set({ locationFilter }),

  selectedFoodId: null,
  openFoodDetail: (id) => set({ selectedFoodId: id }),
  closeFoodDetail: () => set({ selectedFoodId: null }),
}));

/**
 * Predicate: does a food item pass the current dashboard filter?
 */
export function matchesDashboardFilter(
  status: FoodStatus,
  filter: DashboardFilterValue
) {
  if (filter === "all") return true;
  if (filter === "safe") return status === "fresh";
  if (filter === "check") {
    return status === "check_before_use" || status === "not_recommended";
  }
  return status === "use_soon";
}

/**
 * Predicate: does a food item pass the current location filter?
 */
export function matchesLocationFilter(
  location: string,
  filter: LocationFilterValue
) {
  if (filter === "all") return true;
  return location === filter;
}
