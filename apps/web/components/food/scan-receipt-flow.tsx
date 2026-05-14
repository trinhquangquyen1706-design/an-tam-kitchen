"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Barcode,
  CalendarDays,
  Camera,
  CameraOff,
  CheckCircle2,
  Factory,
  Loader2,
  Package,
  QrCode,
  Receipt,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Store,
  Refrigerator,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { scanReceipt } from "@/lib/services/scan-receipt-service";
import type {
  ScanReceiptResponse,
  ScannedItem,
} from "@/lib/services/scan-receipt-service";
import { useBulkAddInventory } from "@/hooks/mutations/use-bulk-add-inventory";
import { QrScanner } from "@/components/food/qr-scanner";

// ─── Constants ──────────────────────────────────────────────

const DEMO_RECEIPT_IDS = [
  "COOP-2026-0513-001",
  "BACH-2026-0513-042",
  "WIN-2026-0513-088",
];

const CATEGORY_LABELS: Record<string, string> = {
  milk: "Sữa",
  sauce: "Nước sốt / gia vị",
  canned_food: "Đồ hộp",
  sausage: "Xúc xích / đồ chế biến",
  drink: "Đồ uống",
  other: "Khác",
};

const LOCATION_LABELS: Record<string, string> = {
  fridge: "Ngăn mát",
  freezer: "Ngăn đông",
  room: "Nhiệt độ phòng",
};

const LOCATION_ICONS: Record<string, string> = {
  fridge: "🧊",
  freezer: "❄️",
  room: "🏠",
};

// ─── Phase type ─────────────────────────────────────────────

type Phase = "scan" | "preview" | "done";

// ─── Component ──────────────────────────────────────────────

export function ScanReceiptFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("scan");
  const [receiptData, setReceiptData] = useState<ScanReceiptResponse | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ─── Scan mutation ──────────────────────────
  const scanMutation = useMutation({
    mutationFn: (receiptId: string) => scanReceipt(receiptId),
    onSuccess: (data) => {
      setReceiptData(data);
      setSelectedItems(new Set(data.items.map((item) => item.tempId)));
      setPhase("preview");
      toast.success(`Đã quét hóa đơn từ ${data.storeName}`, {
        description: `Tìm thấy ${data.items.length} sản phẩm`,
      });
    },
    onError: () => {
      toast.error("Không thể quét hóa đơn", {
        description: "Vui lòng thử lại hoặc kiểm tra kết nối mạng.",
      });
    },
  });

  // ─── Bulk add mutation ──────────────────────
  const bulkAddMutation = useBulkAddInventory();

  const handleQrScan = useCallback(
    (decodedText: string) => {
      // Try to extract receiptId from QR data
      // In production: QR contains full JSON payload from supermarket
      // For demo: QR contains just the receipt ID string
      let receiptId = decodedText;
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.receiptId) receiptId = parsed.receiptId;
      } catch {
        // Not JSON, use raw text as receiptId
      }
      toast.info(`Đã đọc mã QR: ${receiptId.substring(0, 20)}...`);
      scanMutation.mutate(receiptId);
    },
    [scanMutation]
  );

  const handleDemoScan = useCallback(() => {
    const randomId =
      DEMO_RECEIPT_IDS[Math.floor(Math.random() * DEMO_RECEIPT_IDS.length)];
    scanMutation.mutate(randomId);
  }, [scanMutation]);

  const handleBulkAdd = useCallback(() => {
    if (!receiptData) return;

    const itemsToAdd = receiptData.items.filter((item) =>
      selectedItems.has(item.tempId)
    );

    if (itemsToAdd.length === 0) {
      toast.warning("Chưa chọn sản phẩm nào để lưu.");
      return;
    }

    bulkAddMutation.mutate(itemsToAdd, {
      onSuccess: (result) => {
        setPhase("done");
        toast.success(
          `Đã lưu ${result.success} sản phẩm vào tủ lạnh!`,
          result.failed > 0
            ? { description: `${result.failed} sản phẩm lưu thất bại.` }
            : undefined
        );
      },
    });
  }, [receiptData, selectedItems, bulkAddMutation]);

  const toggleItem = (tempId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AnimatePresence mode="wait">
        {phase === "scan" && (
          <ScanPhase
            key="scan"
            isScanning={scanMutation.isPending}
            onDemoScan={handleDemoScan}
            onQrScan={handleQrScan}
          />
        )}

        {phase === "preview" && receiptData && (
          <PreviewPhase
            key="preview"
            data={receiptData}
            selectedItems={selectedItems}
            onToggleItem={toggleItem}
            onBulkAdd={handleBulkAdd}
            onRescan={() => {
              setPhase("scan");
              setReceiptData(null);
            }}
            isSaving={bulkAddMutation.isPending}
          />
        )}

        {phase === "done" && (
          <DonePhase
            key="done"
            successCount={bulkAddMutation.data?.success ?? 0}
            onGoToDashboard={() => router.push("/#digital-fridge")}
            onScanMore={() => {
              setPhase("scan");
              setReceiptData(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCAN PHASE — Live camera + Demo button fallback
// ═══════════════════════════════════════════════════════════

function ScanPhase({
  isScanning,
  onDemoScan,
  onQrScan,
}: {
  isScanning: boolean;
  onDemoScan: () => void;
  onQrScan: (text: string) => void;
}) {
  const [cameraEnabled, setCameraEnabled] = useState(true);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Live camera QR scanner */}
      <Card className="overflow-hidden border-2 border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera aria-hidden={true} className="size-5 text-primary" />
              <CardTitle className="text-base">Quét mã QR hóa đơn</CardTitle>
            </div>
            <Button
              className="h-8 rounded-lg text-xs"
              onClick={() => setCameraEnabled(!cameraEnabled)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {cameraEnabled ? (
                <>
                  <CameraOff className="size-3.5" />
                  Tắt camera
                </>
              ) : (
                <>
                  <Camera className="size-3.5" />
                  Bật camera
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            Đưa mã QR trên hóa đơn siêu thị vào khung hình để quét tự động.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {cameraEnabled ? (
            <QrScanner
              className="overflow-hidden rounded-xl"
              isActive={cameraEnabled && !isScanning}
              onScanSuccess={onQrScan}
            />
          ) : (
            /* Placeholder khi camera tắt */
            <div className="relative flex h-64 flex-col items-center justify-center rounded-2xl bg-muted/50">
              <ScanCorners />
              <QrCode aria-hidden={true} className="size-16 text-muted-foreground/20" />
              <p className="mt-3 text-sm text-muted-foreground">
                Camera đang tắt
              </p>
            </div>
          )}

          {isScanning && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-primary">
              <Loader2 className="size-4 animate-spin" />
              Đang xử lý hóa đơn...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo scan fallback */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ScanLine aria-hidden={true} className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Giả lập quét hóa đơn Demo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Dùng cho trình diễn — tự động gửi mã hóa đơn mẫu lên hệ thống.
              </p>
            </div>
          </div>
          <Button
            className="h-12 w-full rounded-2xl text-base"
            disabled={isScanning}
            onClick={onDemoScan}
            type="button"
          >
            {isScanning ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Đang quét hóa đơn...
              </>
            ) : (
              <>
                <Receipt aria-hidden={true} className="size-5" />
                Giả lập quét hóa đơn
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// PREVIEW PHASE — Receipt items list + Bulk add
// ═══════════════════════════════════════════════════════════

function PreviewPhase({
  data,
  selectedItems,
  onToggleItem,
  onBulkAdd,
  onRescan,
  isSaving,
}: {
  data: ScanReceiptResponse;
  selectedItems: Set<string>;
  onToggleItem: (tempId: string) => void;
  onBulkAdd: () => void;
  onRescan: () => void;
  isSaving: boolean;
}) {
  const selectedCount = selectedItems.size;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Receipt header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100">
              <Store aria-hidden={true} className="size-5 text-emerald-700" />
            </div>
            <div>
              <CardTitle className="text-lg">{data.storeName}</CardTitle>
              <CardDescription>
                Mã: {data.receiptId} •{" "}
                {new Date(data.scannedAt).toLocaleDateString("vi-VN")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Tổng hóa đơn
            </span>
            <span className="font-semibold text-foreground">
              {data.totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Items list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-foreground">
            Sản phẩm ({data.items.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Đã chọn {selectedCount}/{data.items.length}
          </p>
        </div>

        {data.items.map((item, index) => (
          <ScannedItemCard
            index={index}
            isSelected={selectedItems.has(item.tempId)}
            item={item}
            key={item.tempId}
            onToggle={() => onToggleItem(item.tempId)}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <Button
          className="h-12 w-full rounded-2xl text-base"
          disabled={isSaving || selectedCount === 0}
          onClick={onBulkAdd}
          type="button"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Đang lưu {selectedCount} sản phẩm...
            </>
          ) : (
            <>
              <Refrigerator aria-hidden={true} className="size-5" />
              Lưu {selectedCount} sản phẩm vào tủ lạnh
            </>
          )}
        </Button>
        <Button
          className="h-10 w-full rounded-2xl"
          disabled={isSaving}
          onClick={onRescan}
          type="button"
          variant="outline"
        >
          <ScanLine aria-hidden={true} className="size-4" />
          Quét hóa đơn khác
        </Button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// DONE PHASE — Success state
// ═══════════════════════════════════════════════════════════

function DonePhase({
  successCount,
  onGoToDashboard,
  onScanMore,
}: {
  successCount: number;
  onGoToDashboard: () => void;
  onScanMore: () => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <motion.div
            animate={{ scale: 1 }}
            initial={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="flex size-20 items-center justify-center rounded-3xl bg-emerald-100">
              <CheckCircle2
                aria-hidden={true}
                className="size-10 text-emerald-600"
              />
            </div>
          </motion.div>

          <h2 className="mt-6 text-xl font-semibold text-emerald-900">
            Đã lưu thành công!
          </h2>
          <p className="mt-2 text-muted-foreground">
            {successCount} sản phẩm đã được thêm vào tủ lạnh số.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <Button
              className="h-12 w-full rounded-2xl text-base"
              onClick={onGoToDashboard}
              type="button"
            >
              <Sparkles aria-hidden={true} className="size-5" />
              Xem tủ lạnh
            </Button>
            <Button
              className="h-10 w-full rounded-2xl"
              onClick={onScanMore}
              type="button"
              variant="outline"
            >
              <ScanLine aria-hidden={true} className="size-4" />
              Quét thêm hóa đơn
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCANNED ITEM CARD — Enriched with barcode, MFG date, HSD badge
// ═══════════════════════════════════════════════════════════

function ScannedItemCard({
  item,
  isSelected,
  onToggle,
  index,
}: {
  item: ScannedItem;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const isManufacturer = item.expirySource === "manufacturer";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <button
        className={cn(
          "w-full rounded-2xl border p-4 text-left transition-all duration-200",
          isSelected
            ? "border-primary bg-primary/[0.04] shadow-sm"
            : "border-border bg-card opacity-60 hover:opacity-80"
        )}
        onClick={onToggle}
        type="button"
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30"
            )}
          >
            {isSelected && (
              <CheckCircle2 aria-hidden={true} className="size-3.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Name + price */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground">{item.name}</h4>
              <span className="shrink-0 text-sm font-medium text-primary">
                {item.price.toLocaleString("vi-VN")}đ
              </span>
            </div>

            {/* Barcode (if available) */}
            {item.barcode && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
                <Barcode aria-hidden={true} className="size-3" />
                {item.barcode}
              </p>
            )}

            {/* Tags row 1: Category + Location */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                <Package aria-hidden={true} className="size-3" />
                {CATEGORY_LABELS[item.category] ?? item.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                {LOCATION_ICONS[item.storageLocation] ?? "📦"}{" "}
                {LOCATION_LABELS[item.storageLocation] ??
                  item.storageLocation}
              </span>
            </div>

            {/* Tags row 2: Manufacturing date + Expiry + Source badge */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {/* Manufacturing date */}
              {item.manufacturingDate && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  <Factory aria-hidden={true} className="size-3" />
                  NSX: {formatDateVN(item.manufacturingDate)}
                </span>
              )}

              {/* Expiry date */}
              <span className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                <CalendarDays aria-hidden={true} className="size-3" />
                HSD: {formatDateVN(item.suggestedExpiryDate)}
              </span>

              {/* HSD source badge */}
              {isManufacturer ? (
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <ShieldCheck aria-hidden={true} className="size-3" />
                  HSD chính xác
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  <Timer aria-hidden={true} className="size-3" />
                  HSD ước lượng
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function ScanCorners() {
  const cornerClass = "absolute h-6 w-6 border-primary";
  return (
    <>
      <div
        className={cn(cornerClass, "left-3 top-3 rounded-tl-lg border-l-2 border-t-2")}
      />
      <div
        className={cn(cornerClass, "right-3 top-3 rounded-tr-lg border-r-2 border-t-2")}
      />
      <div
        className={cn(cornerClass, "bottom-3 left-3 rounded-bl-lg border-b-2 border-l-2")}
      />
      <div
        className={cn(cornerClass, "bottom-3 right-3 rounded-br-lg border-b-2 border-r-2")}
      />
    </>
  );
}

/** Format YYYY-MM-DD to dd/mm/yyyy Vietnamese style */
function formatDateVN(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
