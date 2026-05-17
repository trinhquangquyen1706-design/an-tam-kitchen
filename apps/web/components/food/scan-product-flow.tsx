"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Barcode,
  CalendarDays,
  Camera,
  CameraOff,
  CheckCircle2,
  Globe,
  HardDrive,
  Loader2,
  Package,
  QrCode,
  ScanLine,
  Sparkles,
  Refrigerator,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  lookupBarcode,
  type BarcodeProduct,
} from "@/lib/services/barcode-lookup-service";
import { useAddInventoryItem } from "@/hooks/mutations/use-add-inventory-item";
import { QrScanner } from "@/components/food/qr-scanner";

// ─── Constants ──────────────────────────────────────────────

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

const SOURCE_CONFIG = {
  openfoodfacts: {
    label: "Open Food Facts",
    icon: Globe,
    color: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-800",
  },
  local_db: {
    label: "CSDL nội bộ",
    icon: HardDrive,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800",
  },
  raw_barcode: {
    label: "Mã vạch thô",
    icon: Barcode,
    color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800",
  },
};

// ─── Phase type ─────────────────────────────────────────────

type Phase = "scan" | "preview" | "done";

// ─── Component ──────────────────────────────────────────────

export function ScanProductFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("scan");
  const [product, setProduct] = useState<BarcodeProduct | null>(null);

  // ─── Barcode lookup mutation ──────────────────
  const lookupMutation = useMutation({
    mutationFn: lookupBarcode,
    onSuccess: (data) => {
      setProduct(data);
      setPhase("preview");
      toast.success(`Đã nhận diện: ${data.name}`, {
        description:
          data.source === "openfoodfacts"
            ? "Thông tin từ Open Food Facts"
            : data.source === "local_db"
              ? "Thông tin từ CSDL nội bộ"
              : "Mã vạch chưa có trong hệ thống",
      });
    },
    onError: () => {
      toast.error("Không thể tra cứu mã vạch", {
        description: "Vui lòng thử lại hoặc nhập thủ công.",
      });
    },
  });

  // ─── Add inventory mutation ───────────────────
  const addItemMutation = useAddInventoryItem();

  const handleBarcodeScan = useCallback(
    (decodedText: string) => {
      // Clean up barcode text
      const barcode = decodedText.trim().replace(/\s/g, "");
      if (!barcode) return;

      toast.info(`Đã đọc mã: ${barcode}`);
      lookupMutation.mutate(barcode);
    },
    [lookupMutation]
  );

  const handleManualBarcode = useCallback(
    (barcode: string) => {
      if (!barcode.trim()) return;
      lookupMutation.mutate(barcode.trim());
    },
    [lookupMutation]
  );

  const handleAddToFridge = useCallback(() => {
    if (!product) return;

    const now = new Date();
    const openedAt = now.toISOString().split("T")[0];
    const expiryDate = new Date(
      now.getTime() + product.daysAfterOpen * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    addItemMutation.mutate(
      {
        name: product.name,
        category: product.category as any,
        openedAt,
        expiryDate,
        storageLocation: product.storageLocation as any,
        notes: product.brand
          ? `${product.brand} • Mã: ${product.barcode}`
          : `Mã: ${product.barcode}`,
      },
      {
        onSuccess: () => {
          setPhase("done");
          toast.success(`Đã thêm "${product.name}" vào tủ lạnh!`);
        },
      }
    );
  }, [product, addItemMutation]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AnimatePresence mode="wait">
        {phase === "scan" && (
          <ProductScanPhase
            key="scan"
            isScanning={lookupMutation.isPending}
            onBarcodeScan={handleBarcodeScan}
            onManualBarcode={handleManualBarcode}
          />
        )}

        {phase === "preview" && product && (
          <ProductPreviewPhase
            key="preview"
            product={product}
            onAddToFridge={handleAddToFridge}
            onRescan={() => {
              setPhase("scan");
              setProduct(null);
            }}
            isSaving={addItemMutation.isPending}
          />
        )}

        {phase === "done" && (
          <ProductDonePhase
            key="done"
            productName={product?.name ?? "Sản phẩm"}
            onGoToDashboard={() => router.push("/#digital-fridge")}
            onScanMore={() => {
              setPhase("scan");
              setProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCAN PHASE — Camera scanner + Manual barcode input
// ═══════════════════════════════════════════════════════════

function ProductScanPhase({
  isScanning,
  onBarcodeScan,
  onManualBarcode,
}: {
  isScanning: boolean;
  onBarcodeScan: (text: string) => void;
  onManualBarcode: (barcode: string) => void;
}) {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [manualBarcode, setManualBarcode] = useState("");

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Live camera barcode/QR scanner */}
      <Card className="overflow-hidden border-2 border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera aria-hidden={true} className="size-5 text-primary" />
              <CardTitle className="text-base">
                Quét mã vạch / QR sản phẩm
              </CardTitle>
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
            Đưa mã vạch hoặc mã QR trên sản phẩm vào khung hình. Hệ thống sẽ
            tự động tra cứu thông tin sản phẩm thật.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {cameraEnabled ? (
            <QrScanner
              className="overflow-hidden rounded-xl"
              isActive={cameraEnabled && !isScanning}
              onScanSuccess={onBarcodeScan}
            />
          ) : (
            <div className="relative flex h-64 flex-col items-center justify-center rounded-2xl bg-muted/50">
              <ScanCorners />
              <Barcode
                aria-hidden={true}
                className="size-16 text-muted-foreground/20"
              />
              <p className="mt-3 text-sm text-muted-foreground">
                Camera đang tắt
              </p>
            </div>
          )}

          {isScanning && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-primary">
              <Loader2 className="size-4 animate-spin" />
              Đang tra cứu sản phẩm...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual barcode input */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Barcode aria-hidden={true} className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Nhập mã vạch thủ công
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nếu camera không quét được, bạn có thể nhập mã vạch bên dưới
                bao bì sản phẩm.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              className="h-12 rounded-xl font-mono text-base tracking-widest"
              placeholder="VD: 8935217400010"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualBarcode.trim()) {
                  onManualBarcode(manualBarcode);
                }
              }}
            />
            <Button
              className="h-12 rounded-xl px-6"
              disabled={isScanning || !manualBarcode.trim()}
              onClick={() => onManualBarcode(manualBarcode)}
              type="button"
            >
              {isScanning ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Tra cứu"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// PREVIEW PHASE — Show looked-up product info + confirm add
// ═══════════════════════════════════════════════════════════

function ProductPreviewPhase({
  product,
  onAddToFridge,
  onRescan,
  isSaving,
}: {
  product: BarcodeProduct;
  onAddToFridge: () => void;
  onRescan: () => void;
  isSaving: boolean;
}) {
  const sourceConfig = SOURCE_CONFIG[product.source];
  const SourceIcon = sourceConfig.icon;

  const now = new Date();
  const expiryDate = new Date(
    now.getTime() + product.daysAfterOpen * 24 * 60 * 60 * 1000
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Product card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {/* Product image or placeholder */}
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="size-full object-cover"
                  unoptimized
                />
              ) : (
                <Package className="size-8 text-muted-foreground/40" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">
                {product.name}
              </CardTitle>
              {product.brand && (
                <CardDescription className="mt-1">
                  {product.brand}
                </CardDescription>
              )}
              {/* Source badge */}
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium",
                  sourceConfig.color
                )}
              >
                <SourceIcon aria-hidden className="size-3" />
                {sourceConfig.label}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 pt-0">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <InfoPill
              icon={Barcode}
              label="Mã vạch"
              value={product.barcode}
            />
            <InfoPill
              icon={Package}
              label="Phân loại"
              value={CATEGORY_LABELS[product.category] ?? product.category}
            />
            <InfoPill
              icon={Refrigerator}
              label="Vị trí"
              value={
                LOCATION_LABELS[product.storageLocation] ??
                product.storageLocation
              }
            />
            <InfoPill
              icon={CalendarDays}
              label="HSD ước lượng"
              value={`${product.daysAfterOpen} ngày`}
            />
          </div>

          {product.quantity && (
            <p className="text-xs text-muted-foreground">
              Khối lượng: {product.quantity}
            </p>
          )}

          {/* Auto-calculated expiry */}
          <div className="rounded-xl bg-accent/50 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ngày mở nắp</span>
              <span className="font-medium">
                {now.toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hạn sử dụng</span>
              <span className="font-semibold text-primary">
                {expiryDate.toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          className="h-12 w-full rounded-2xl text-base"
          disabled={isSaving}
          onClick={onAddToFridge}
          type="button"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Refrigerator aria-hidden className="size-5" />
              Thêm vào tủ lạnh
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
          <ScanLine aria-hidden className="size-4" />
          Quét sản phẩm khác
        </Button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// DONE PHASE
// ═══════════════════════════════════════════════════════════

function ProductDonePhase({
  productName,
  onGoToDashboard,
  onScanMore,
}: {
  productName: string;
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
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <motion.div
            animate={{ scale: 1 }}
            initial={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="flex size-20 items-center justify-center rounded-3xl bg-emerald-100">
              <CheckCircle2 className="size-10 text-emerald-600" />
            </div>
          </motion.div>

          <h2 className="mt-6 text-xl font-semibold text-emerald-900">
            Đã thêm thành công!
          </h2>
          <p className="mt-2 text-muted-foreground">
            "{productName}" đã được thêm vào tủ lạnh số.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <Button
              className="h-12 w-full rounded-2xl text-base"
              onClick={onGoToDashboard}
              type="button"
            >
              <Sparkles aria-hidden className="size-5" />
              Xem tủ lạnh
            </Button>
            <Button
              className="h-10 w-full rounded-2xl"
              onClick={onScanMore}
              type="button"
              variant="outline"
            >
              <ScanLine aria-hidden className="size-4" />
              Quét thêm sản phẩm
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-accent/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function ScanCorners() {
  const cornerClass = "absolute h-6 w-6 border-primary";
  return (
    <>
      <div
        className={cn(
          cornerClass,
          "left-3 top-3 rounded-tl-lg border-l-2 border-t-2"
        )}
      />
      <div
        className={cn(
          cornerClass,
          "right-3 top-3 rounded-tr-lg border-r-2 border-t-2"
        )}
      />
      <div
        className={cn(
          cornerClass,
          "bottom-3 left-3 rounded-bl-lg border-b-2 border-l-2"
        )}
      />
      <div
        className={cn(
          cornerClass,
          "bottom-3 right-3 rounded-br-lg border-b-2 border-r-2"
        )}
      />
    </>
  );
}
