/**
 * useBulkAddInventory — Add multiple items from scanned receipt
 *
 * Calls createInventoryItem for each item in parallel,
 * then invalidates the inventory list query.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "@/lib/react-query/query-keys";
import { createInventoryItem } from "@/lib/services/inventory-service";
import type { ScannedItem } from "@/lib/services/scan-receipt-service";
import type { CreateFoodInput } from "@/lib/api/types";

type BulkAddResult = {
  success: number;
  failed: number;
  errors: string[];
};

export function useBulkAddInventory() {
  const queryClient = useQueryClient();

  return useMutation<BulkAddResult, Error, ScannedItem[]>({
    mutationFn: async (items) => {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

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
          } else {
            failed++;
            errors.push(result.reason?.message ?? "Unknown error");
          }
        }
      }

      if (success === 0 && failed > 0) {
        throw new Error(`Không thể lưu thực phẩm: ${errors[0]}`);
      }

      return { success, failed, errors };
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}
