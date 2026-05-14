/**
 * useDeleteInventoryItem — Optimistic Delete with Rollback
 *
 * Full combo:
 *  onMutate  → cancelQueries → snapshot → optimistic remove
 *  onError   → rollback
 *  onSettled → invalidate
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "@/lib/react-query/query-keys";
import { deleteInventoryItem } from "@/lib/services/inventory-service";
import type { InventoryListData } from "@/hooks/queries/use-inventory-list";

type DeleteContext = {
  previousData: InventoryListData | undefined;
};

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, DeleteContext>({
    mutationFn: (id) => deleteInventoryItem(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });

      const previousData = queryClient.getQueryData<InventoryListData>(
        inventoryKeys.lists()
      );

      // Optimistic remove
      queryClient.setQueryData<InventoryListData>(
        inventoryKeys.lists(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
          };
        }
      );

      return { previousData };
    },

    onError: (_error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(inventoryKeys.lists(), context.previousData);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}
