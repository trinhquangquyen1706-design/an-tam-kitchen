/**
 * useBulkAddInventory — Add multiple items from scanned receipt
 *
 * Calls createInventoryItem for each item in parallel,
 * then adds them to the React Query cache directly (no refetch).
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "@/lib/react-query/query-keys";
import { createInventoryItem } from "@/lib/services/inventory-service";
import { mapFoodApiRecordToViewModel } from "@/lib/mappers/food-mapper";
import type { ScannedItem } from "@/lib/services/scan-receipt-service";
import type { CreateFoodInput, FoodItemViewModel, FoodApiRecord } from "@/lib/api/types";
import type { InventoryListData } from "@/hooks/queries/use-inventory-list";

type BulkAddResult = {
  success: number;
  failed: number;
  errors: string[];
  /** Successfully created items to add to cache */
  addedItems: FoodItemViewModel[];
};

export function useBulkAddInventory() {
  const queryClient = useQueryClient();

  return useMutation<BulkAddResult, Error, ScannedItem[]>({
    mutationFn: async (items) => {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];
      const addedRecords: FoodApiRecord[] = [];

      // Process in parallel batches of 3
      const BATCH_SIZE = 3;
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((item) => {
            const input: CreateFoodInput = {
              name: item.name,
              category: item.category as CreateFoodInput["category"],
              storageLocation: item.storageLocation as CreateFoodInput["storageLocation"],
              openedAt: item.suggestedOpenedAt,
              expiryDate: item.suggestedExpiryDate,
              notes: `Từ hóa đơn — ${item.price?.toLocaleString("vi-VN")}đ`,
            };
            return createInventoryItem(input);
          })
        );

        for (const result of results) {
          if (result.status === "fulfilled") {
            success++;
            addedRecords.push(result.value);
          } else {
            failed++;
            errors.push(result.reason?.message ?? "Unknown error");
          }
        }
      }

      if (success === 0 && failed > 0) {
        throw new Error(`Không thể lưu thực phẩm: ${errors[0]}`);
      }

      const now = new Date();
      const addedItems = addedRecords.map((r) =>
        mapFoodApiRecordToViewModel(r, "api", now)
      );

      return { success, failed, errors, addedItems };
    },

    onSuccess: (result) => {
      // Add the newly created items to the cache directly
      // This avoids refetching from the API (which would lose data on serverless)
      if (result.addedItems.length > 0) {
        queryClient.setQueryData<InventoryListData>(
          inventoryKeys.lists(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: [...result.addedItems, ...old.items],
            };
          }
        );
      }
    },

    // NOTE: No invalidateQueries — on Vercel serverless, refetching
    // would overwrite newly added items with seed-only data.
  });
}
