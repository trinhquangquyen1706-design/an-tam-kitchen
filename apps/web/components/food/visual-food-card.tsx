"use client";

import Image from "next/image";
import { differenceInCalendarDays } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Types ──────────────────────────────────────────────────

export type FoodCardStatus = "fresh" | "nearing" | "expired";

export type VisualFoodItem = {
  id: string;
  name: string;
  quantity: string;
  imageSrc: string;
  expiryDate: Date;
  status: FoodCardStatus;
};

// ─── Status helpers ─────────────────────────────────────────

function getStatusConfig(status: FoodCardStatus, daysLeft: number) {
  switch (status) {
    case "fresh":
      return {
        label: `Tươi ngon (Còn ${daysLeft} ngày)`,
        dotColor: "bg-emerald-500",
        textColor: "text-emerald-700 dark:text-emerald-300",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      };
    case "nearing":
      return {
        label:
          daysLeft === 0
            ? "Dùng sớm (Hôm nay)"
            : `Dùng sớm (Còn ${daysLeft} ngày)`,
        dotColor: "bg-amber-500",
        textColor: "text-amber-700 dark:text-amber-300",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
      };
    case "expired": {
      const daysAgo = Math.abs(daysLeft);
      return {
        label:
          daysAgo === 0
            ? "Quá hạn (Hôm nay)"
            : daysAgo === 1
              ? "Quá hạn (Hôm qua)"
              : `Quá hạn (${daysAgo} ngày trước)`,
        dotColor: "bg-red-500",
        textColor: "text-red-700 dark:text-red-300",
        bgColor: "bg-red-50 dark:bg-red-950/30",
      };
    }
  }
}

// ─── Component ──────────────────────────────────────────────

export function VisualFoodCard({
  item,
  index = 0,
  onEat,
  onDiscard,
}: {
  item: VisualFoodItem;
  index?: number;
  onEat?: (id: string) => void;
  onDiscard?: (id: string) => void;
}) {
  const now = new Date();
  const daysLeft = differenceInCalendarDays(item.expiryDate, now);
  const statusConfig = getStatusConfig(item.status, daysLeft);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      {/* ── Image ── */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-b from-muted/30 to-muted/60 p-4">
        <Image
          src={item.imageSrc}
          alt={item.name}
          width={180}
          height={135}
          className="h-auto max-h-[110px] w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          priority={index < 4}
        />
      </div>

      {/* ── Info ── */}
      <div className="flex flex-1 flex-col p-4 pt-3">
        <h3 className="text-sm font-bold leading-tight text-foreground">
          {item.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{item.quantity}</p>

        {/* Status badge */}
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold",
            statusConfig.bgColor,
            statusConfig.textColor
          )}
        >
          <span
            className={cn(
              "inline-block size-2 shrink-0 rounded-full",
              statusConfig.dotColor
            )}
          />
          {statusConfig.label}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex border-t">
        <Button
          className="flex-1 gap-1.5 rounded-none border-r border-border text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
          onClick={() => onEat?.(item.id)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Check aria-hidden className="size-3.5" />
          Đã ăn
        </Button>
        <Button
          className="flex-1 gap-1.5 rounded-none text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          onClick={() => onDiscard?.(item.id)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden className="size-3.5" />
          Bỏ đi
        </Button>
      </div>
    </motion.div>
  );
}
