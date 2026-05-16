"use client";

import { differenceInCalendarDays, differenceInHours } from "date-fns";
import { Check, MapPin, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { FoodStatus } from "@repo/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VisualFoodCardProps = {
  id: string;
  name: string;
  imageUrl?: string;
  location: string;
  locationLabel: string;
  status: FoodStatus;
  openedAt?: Date | null;
  expiryDate: Date;
  onMarkEaten?: (id: string) => void;
  onDiscard?: (id: string) => void;
  index?: number;
};

/** Category-based placeholder images from Unsplash (royalty free) */
const PLACEHOLDER_IMAGES: Record<string, string> = {
  dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
  meat_poultry: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=400&h=300&fit=crop",
  sauces_spices: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=300&fit=crop",
  vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
  fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop",
  default: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=300&fit=crop",
};

const STATUS_CONFIG: Record<FoodStatus, { label: string; color: string; barColor: string }> = {
  fresh: { label: "Tươi mới", color: "text-emerald-700 bg-emerald-50", barColor: "bg-emerald-500" },
  use_soon: { label: "Nên dùng sớm", color: "text-amber-700 bg-amber-50", barColor: "bg-amber-500" },
  check_before_use: { label: "Kiểm tra kỹ", color: "text-orange-700 bg-orange-50", barColor: "bg-orange-500" },
  not_recommended: { label: "Quá hạn", color: "text-red-700 bg-red-50", barColor: "bg-red-500" },
};

function getFreshnessPercent(openedAt: Date | null | undefined, expiryDate: Date): number {
  const now = new Date();
  const opened = openedAt ?? now;
  const totalHours = differenceInHours(expiryDate, opened);
  const elapsedHours = differenceInHours(now, opened);
  if (totalHours <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((1 - elapsedHours / totalHours) * 100)));
}

function getDaysRemaining(expiryDate: Date): number {
  return differenceInCalendarDays(expiryDate, new Date());
}

function getPlaceholderImage(name: string): string {
  const lowered = name.toLowerCase();
  if (lowered.includes("sữa") || lowered.includes("phô mai") || lowered.includes("bơ")) return PLACEHOLDER_IMAGES.dairy;
  if (lowered.includes("thịt") || lowered.includes("xúc xích") || lowered.includes("gà")) return PLACEHOLDER_IMAGES.meat_poultry;
  if (lowered.includes("tương") || lowered.includes("nước mắm") || lowered.includes("gia vị")) return PLACEHOLDER_IMAGES.sauces_spices;
  if (lowered.includes("rau") || lowered.includes("cải") || lowered.includes("hành")) return PLACEHOLDER_IMAGES.vegetables;
  if (lowered.includes("cam") || lowered.includes("táo") || lowered.includes("chuối")) return PLACEHOLDER_IMAGES.fruits;
  return PLACEHOLDER_IMAGES.default;
}

export function VisualFoodCard({
  id,
  name,
  imageUrl,
  location,
  locationLabel,
  status,
  openedAt,
  expiryDate,
  onMarkEaten,
  onDiscard,
  index = 0,
}: VisualFoodCardProps) {
  const config = STATUS_CONFIG[status];
  const freshness = getFreshnessPercent(openedAt, expiryDate);
  const daysLeft = getDaysRemaining(expiryDate);
  const imgSrc = imageUrl || getPlaceholderImage(name);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.04, 0.2),
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <Link href={`/foods/${id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imgSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={imgSrc.startsWith("http")}
        />

        {/* Status badge overlay */}
        <span className={cn(
          "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm",
          config.color
        )}>
          {config.label}
        </span>

        {/* Location badge */}
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <MapPin className="size-3" />
          {locationLabel}
        </span>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Name */}
        <Link href={`/foods/${id}`}>
          <h3 className="truncate text-sm font-bold leading-tight text-foreground transition-colors hover:text-primary">
            {name}
          </h3>
        </Link>

        {/* Progress bar */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-muted-foreground">Độ tươi</span>
            <span className="font-bold tabular-nums text-foreground">{freshness}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn("h-full rounded-full", config.barColor)}
              initial={{ width: 0 }}
              animate={{ width: `${freshness}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.04 }}
            />
          </div>
        </div>

        {/* Expiry note */}
        <p className="mt-2 text-xs text-muted-foreground">
          {daysLeft > 0
            ? `Hết hạn: ${daysLeft} ngày`
            : daysLeft === 0
              ? "Hết hạn: Hôm nay"
              : `Đã quá hạn ${Math.abs(daysLeft)} ngày`}
        </p>

        {/* Action buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg border-emerald-300 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            onClick={() => onMarkEaten?.(id)}
          >
            <Check className="mr-1 size-3.5" />
            Đã ăn
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg border-red-300 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDiscard?.(id)}
          >
            <Trash2 className="mr-1 size-3.5" />
            Bỏ đi
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
