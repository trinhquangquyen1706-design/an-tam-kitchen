"use client";

import { differenceInCalendarDays, format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Info,
  LoaderCircle,
  MapPin,
  NotebookText,
  PackageOpen,
  Tags,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { FoodStatus } from "@repo/types";
import {
  EmptyState,
  FoodStatusBadge,
  LoadingState,
  SectionCard,
} from "@/components/foundation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useInventoryDetail } from "@/hooks/queries/use-inventory-detail";
import { useDeleteInventoryItem } from "@/hooks/mutations/use-delete-inventory-item";
import type { FoodItemViewModel } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type DetailLineProps = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  muted?: boolean;
};

const recommendationByStatus: Record<FoodStatus, string> = {
  fresh:
    "Sản phẩm vẫn đang trong thời gian khuyến nghị. Hãy tiếp tục bảo quản đúng cách.",
  use_soon: "Nên ưu tiên sử dụng sản phẩm này trong thời gian gần.",
  check_before_use:
    "Nên kiểm tra mùi, màu sắc và hướng dẫn trên bao bì trước khi sử dụng.",
  not_recommended:
    "Không khuyến nghị tiếp tục để quá lâu. Hãy cân nhắc loại bỏ nếu có dấu hiệu bất thường.",
};

const disclaimer =
  "Thông tin chỉ mang tính tham khảo. Hãy kiểm tra mùi, màu sắc và hướng dẫn trên bao bì trước khi sử dụng.";

/**
 * Wrapper with Suspense boundary for skeleton (Pillar 4).
 */
export function FoodDetailView({ foodId }: { foodId: string }) {
  return (
    <Suspense
      fallback={
        <DetailShell>
          <LoadingState
            description="Đang tải thông tin chi tiết và trạng thái khuyến nghị."
            title="Đang mở chi tiết thực phẩm"
          />
        </DetailShell>
      }
    >
      <FoodDetailContent foodId={foodId} />
    </Suspense>
  );
}

function FoodDetailContent({ foodId }: { foodId: string }) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { data } = useInventoryDetail(foodId);
  const { item: food, usingMockFallback } = data;
  const deleteMutation = useDeleteInventoryItem();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!food) {
    return (
      <DetailShell>
        <EmptyState
          description="Món này không có trong dữ liệu hiện tại. Bạn có thể quay lại dashboard để chọn món khác."
          title="Không tìm thấy thực phẩm"
        />
        <BackToDashboard className="mt-4" />
      </DetailShell>
    );
  }

  const openedLabel = food.openedAt
    ? format(food.openedAt, "dd/MM/yyyy")
    : "Chưa ghi nhận";
  const openedDays = food.openedAt
    ? Math.max(0, differenceInCalendarDays(new Date(), food.openedAt))
    : null;
  const expiryLabel = food.hasExplicitExpiryDate
    ? format(food.expiryDate, "dd/MM/yyyy")
    : "Chưa ghi nhận";

  return (
    <DetailShell>
      {usingMockFallback ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-950">
          <AlertCircle aria-hidden={true} className="size-4" />
          <AlertTitle>Đang dùng dữ liệu mẫu</AlertTitle>
          <AlertDescription className="text-amber-900">
            Đang hiển thị dữ liệu mẫu. Kết nối mạng để cập nhật thông tin mới
            nhất.
          </AlertDescription>
        </Alert>
      ) : null}

      <motion.section
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        className="rounded-3xl border bg-background p-5 shadow-sm sm:p-6"
        initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Chi tiết thực phẩm
            </p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-normal sm:text-4xl">
              {food.displayName}
            </h1>
          </div>
          <FoodStatusBadge className="w-fit max-w-full" status={food.status} />
        </div>

        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
          {recommendationByStatus[food.status]}
        </p>
      </motion.section>

      <motion.div
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]"
        initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
        transition={{ delay: 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionCard
          description="Các mốc chính giúp gia đình xem lại thông tin trước khi sử dụng."
          eyebrow="Thông tin sản phẩm"
          title="Mốc bảo quản"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailLine
              icon={CalendarDays}
              label="Ngày mở nắp"
              value={openedLabel}
            />
            <DetailLine
              icon={Clock3}
              label="Số ngày đã mở"
              value={
                openedDays === null ? "Chưa ghi nhận" : `${openedDays} ngày`
              }
            />
            <DetailLine
              icon={MapPin}
              label="Vị trí bảo quản"
              value={food.locationLabel}
            />
            <DetailLine
              icon={Tags}
              label="Nhóm thực phẩm"
              value={food.categoryLabel}
            />
            <DetailLine
              icon={PackageOpen}
              label="Hạn sử dụng trên bao bì"
              value={expiryLabel}
            />
            <DetailLine
              icon={NotebookText}
              label="Ghi chú"
              muted={!food.notes}
              value={food.notes ?? "Chưa có ghi chú"}
            />
          </div>
        </SectionCard>

        <SectionCard
          description="Phần này giải thích vì sao Bếp An Tâm đưa ra khuyến nghị hiện tại."
          eyebrow="Nguồn trạng thái"
          title="Vì sao có trạng thái này?"
        >
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm font-semibold text-primary">
              {food.statusSourceLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {food.statusExplanation}
            </p>
          </div>

          <div
            className={cn(
              "mt-4 rounded-2xl border p-4 text-sm leading-6",
              food.status === "not_recommended"
                ? "border-rose-200 bg-rose-50 text-rose-950"
                : "border-amber-200 bg-amber-50 text-amber-950",
            )}
          >
            <p className="font-semibold">Khuyến nghị theo trạng thái</p>
            <p className="mt-2">{recommendationByStatus[food.status]}</p>
          </div>
        </SectionCard>
      </motion.div>

      <Alert className="border-sky-200 bg-sky-50 text-sky-950">
        <Info aria-hidden={true} className="size-4" />
        <AlertTitle>Lưu ý khi sử dụng</AlertTitle>
        <AlertDescription className="text-sky-900">
          {disclaimer}
        </AlertDescription>
      </Alert>

      {/* ─── Action bar ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackToDashboard />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              className="h-11 justify-center rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:w-fit"
              variant="outline"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
              ) : (
                <Trash2 aria-hidden className="size-4" />
              )}
              {deleteMutation.isPending ? "Đang xóa..." : "Đã dùng xong"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa thực phẩm</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa <strong>{food.displayName}</strong> khỏi
                tủ lạnh số? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl">Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
                onClick={async () => {
                  try {
                    await deleteMutation.mutateAsync(foodId);
                    toast.success(
                      `Đã xóa "${food.displayName}" khỏi tủ lạnh`,
                      { description: "Danh sách đã được cập nhật." },
                    );
                    router.push("/dashboard");
                  } catch {
                    toast.error("Không thể xóa thực phẩm", {
                      description: "Vui lòng thử lại sau.",
                    });
                  }
                }}
              >
                Xóa thực phẩm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DetailShell>
  );
}

function DetailShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      {children}
    </div>
  );
}

function DetailLine({ icon: Icon, label, value, muted }: DetailLineProps) {
  return (
    <div className="flex min-h-20 items-start gap-3 rounded-2xl border bg-background p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon aria-hidden={true} className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "mt-2 block wrap-break-words text-base font-semibold leading-6",
            muted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}

function BackToDashboard({ className }: { className?: string }) {
  return (
    <Button
      asChild
      className={cn(
        "h-11 w-full justify-center rounded-2xl sm:w-fit",
        className,
      )}
      variant="outline"
    >
      <Link href="/dashboard">
        <ArrowLeft aria-hidden={true} className="size-4" />
        Quay lại tủ lạnh
      </Link>
    </Button>
  );
}
