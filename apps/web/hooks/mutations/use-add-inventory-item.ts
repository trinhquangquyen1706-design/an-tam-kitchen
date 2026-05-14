/**
 * Pillar 3: useAddInventoryItem — Optimistic Update & Rollback
 *
 * Full combo:
 *  onMutate  → cancelQueries → snapshot cache → setQueryData (optimistic)
 *  onSuccess → replace optimistic item with real server data
 *  onError   → rollback bằng snapshot
 *
 * NOTE: We do NOT invalidate/refetch after mutation because on Vercel
 * serverless, each GET may hit a different instance that doesn't have
 * the newly added item in memory. The React Query cache is the
 * source of truth for the current session.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "@/lib/react-query/query-keys";
import { createInventoryItem } from "@/lib/services/inventory-service";
import { createUserProduct } from "@/lib/api/user-products";
import { mapFoodApiRecordToViewModel } from "@/lib/mappers/food-mapper";
import type { CreateFoodInput, FoodItemViewModel } from "@/lib/api/types";
import type { InventoryListData } from "@/hooks/queries/use-inventory-list";

type AddInventoryContext = {
  /** Snapshot of the cache before optimistic update, used for rollback */
  previousData: InventoryListData | undefined;
  /** Temp ID of the optimistic item so we can replace it on success */
  optimisticId: string;
};

export function useAddInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation<
    FoodItemViewModel,
    Error,
    CreateFoodInput,
    AddInventoryContext
  >({
    mutationFn: async (input) => {
      // Fire both requests in parallel
      const [record] = await Promise.all([
        createInventoryItem(input),
        createUserProduct({
          name: input.name,
          category: input.category,
          storageLocation: input.storageLocation,
          note: input.notes || undefined,
        }),
      ]);

      return mapFoodApiRecordToViewModel(record, "api", new Date());
    },

    onMutate: async (input) => {
      // 1. Cancel any in-flight inventory list queries
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });

      // 2. Snapshot current cache for potential rollback
      const previousData = queryClient.getQueryData<InventoryListData>(
        inventoryKeys.lists()
      );

      // 3. Optimistically update the cache with a temporary item
      const optimisticId = `optimistic-${Date.now()}`;
      queryClient.setQueryData<InventoryListData>(
        inventoryKeys.lists(),
        (old) => {
          if (!old) return old;

          const optimisticItem = createOptimisticItem(input, optimisticId);

          return {
            ...old,
            items: [optimisticItem, ...old.items],
          };
        }
      );

      return { previousData, optimisticId };
    },

    onSuccess: (realItem, _input, context) => {
      // Replace the optimistic item with the real server data
      // This preserves ALL existing items in cache (including previous adds)
      queryClient.setQueryData<InventoryListData>(
        inventoryKeys.lists(),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((item) =>
              item.id === context?.optimisticId ? realItem : item
            ),
          };
        }
      );
    },

    onError: (_error, _input, context) => {
      // Rollback to the snapshot
      if (context?.previousData) {
        queryClient.setQueryData(inventoryKeys.lists(), context.previousData);
      }
    },

    // NOTE: No onSettled/invalidateQueries! On serverless, refetching
    // would overwrite our cache with stale seed-only data.
  });
}

/**
 * Build a temporary FoodItemViewModel for optimistic rendering.
 * This will be replaced by the real item once onSuccess fires.
 */
function createOptimisticItem(input: CreateFoodInput, id?: string): FoodItemViewModel {
  const now = new Date();
  const tempId = id || `optimistic-${Date.now()}`;
  const openedAt = input.openedAt ? new Date(`${input.openedAt}T00:00:00`) : now;
  const expiryDate = input.expiryDate
    ? new Date(`${input.expiryDate}T00:00:00`)
    : new Date(openedAt.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days default

  return {
    id: tempId,
    userId: "",
    productId: "",
    displayName: input.name,
    categoryLabel: input.category,
    openedAt,
    expiryDate,
    hasExplicitExpiryDate: Boolean(input.expiryDate),
    location: input.storageLocation === "fridge"
      ? "fridge"
      : input.storageLocation === "freezer"
        ? "freezer"
        : "room_temp",
    locationLabel:
      input.storageLocation === "fridge"
        ? "Ngăn mát"
        : input.storageLocation === "freezer"
          ? "Ngăn đông"
          : "Nhiệt độ phòng",
    status: "fresh",
    statusMeta: {
      status: "fresh",
      label: "Còn trong thời gian khuyến nghị",
      description: "Món này vẫn nằm trong mốc tham chiếu hiện có.",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    statusSource: "temporary_rule",
    statusSourceLabel: "Trạng thái tạm (optimistic)",
    statusExplanation: "Đang chờ phản hồi từ server, hiển thị dữ liệu tạm.",
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    source: "api",
  };
}
