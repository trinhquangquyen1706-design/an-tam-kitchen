/**
 * Pillar 4: useInventoryDetail — useSuspenseQuery cho chi tiết thực phẩm
 *
 * On Vercel serverless, GET /api/inventory/[id] may hit a different instance
 * that doesn't have the item. So we prioritize reading from the React Query
 * cache (populated by the list query) before falling back to the API.
 */

"use client";

import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "@/lib/react-query/query-keys";
import { fetchInventoryItem } from "@/lib/services/inventory-service";
import { isAuthError } from "@/lib/api/client";
import { getMockFoodRecords } from "@/lib/api/mock-foods";
import {
  mapFoodApiRecordToViewModel,
  mapFoodApiRecordsToViewModels,
} from "@/lib/mappers/food-mapper";
import type { FoodItemViewModel, FoodDataSource } from "@/lib/api/types";
import type { InventoryListData } from "@/hooks/queries/use-inventory-list";

export type InventoryDetailData = {
  item: FoodItemViewModel | null;
  source: FoodDataSource;
  usingMockFallback: boolean;
};

export function useInventoryDetail(id: string) {
  const queryClient = useQueryClient();

  return useSuspenseQuery<InventoryDetailData>({
    queryKey: inventoryKeys.detail(id),

    queryFn: async ({ signal }) => {
      const now = new Date();

      // 1. Try to find the item in the inventory list cache first
      //    This avoids hitting a different serverless instance that doesn't have the item
      const cachedList = queryClient.getQueryData<InventoryListData>(
        inventoryKeys.lists()
      );
      if (cachedList) {
        const cachedItem = cachedList.items.find((item) => item.id === id);
        if (cachedItem) {
          return {
            item: cachedItem,
            source: cachedList.source,
            usingMockFallback: cachedList.usingMockFallback,
          };
        }
      }

      // 2. Cache miss — try the API
      try {
        const record = await fetchInventoryItem(id, { signal });

        if (!record) {
          return {
            item: null,
            source: "api" as const,
            usingMockFallback: false,
          };
        }

        return {
          item: mapFoodApiRecordToViewModel(record, "api", now),
          source: "api" as const,
          usingMockFallback: false,
        };
      } catch (error) {
        if (isAuthError(error)) throw error;

        // 3. Fallback: search mock data for the item
        const mockRecords = getMockFoodRecords(now);
        const items = mapFoodApiRecordsToViewModels(mockRecords, "mock", now);
        const item = items.find((food) => food.id === id) ?? null;

        return {
          item,
          source: "mock" as const,
          usingMockFallback: true,
        };
      }
    },
  });
}
