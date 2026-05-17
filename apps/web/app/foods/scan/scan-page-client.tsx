"use client";

import { useState } from "react";
import {
  Barcode,
  Package,
  QrCode,
  Receipt,
  ShoppingCart,
  Sparkles,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScanReceiptFlow } from "@/components/food/scan-receipt-flow";
import { ScanProductFlow } from "@/components/food/scan-product-flow";

type ScanMode = "product" | "receipt";

export function ScanPageClient() {
  const [mode, setMode] = useState<ScanMode>("product");

  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-4 sm:gap-6 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
      {/* ═══ LEFT: Info + Mode Tabs ═══ */}
      <section className="lg:pt-3">
        {/* Mode selector tabs */}
        <div className="flex gap-2 rounded-2xl border bg-muted/50 p-1.5">
          <ModeTab
            active={mode === "product"}
            icon={Barcode}
            label="Quét thực phẩm"
            onClick={() => setMode("product")}
          />
          <ModeTab
            active={mode === "receipt"}
            icon={Receipt}
            label="Quét hóa đơn"
            onClick={() => setMode("receipt")}
          />
        </div>

        {/* Dynamic info based on mode */}
        {mode === "product" ? (
          <ProductModeInfo />
        ) : (
          <ReceiptModeInfo />
        )}
      </section>

      {/* ═══ RIGHT: Scan Flow ═══ */}
      {mode === "product" ? <ScanProductFlow /> : <ScanReceiptFlow />}
    </div>
  );
}

// ─── Mode Tab Button ────────────────────────────────────────

function ModeTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

// ─── Product Mode Info Panel ────────────────────────────────

function ProductModeInfo() {
  return (
    <>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm font-medium text-primary shadow-sm">
        <Barcode aria-hidden className="size-4" />
        Quét sản phẩm
      </p>
      <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-normal sm:text-4xl">
        Quét mã vạch để thêm thực phẩm
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        Quét mã vạch hoặc mã QR trên bao bì sản phẩm. Hệ thống sẽ tự động tra
        cứu thông tin thật từ cơ sở dữ liệu sản phẩm và thêm vào tủ lạnh số.
      </p>

      <div className="mt-6 grid gap-3">
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <ScanLine aria-hidden className="mb-3 size-5 text-primary" />
          <p className="font-semibold">Đọc mã vạch thật</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Camera sẽ đọc mã vạch/QR trên sản phẩm và tra cứu thông tin thật
            từ Open Food Facts hoặc CSDL nội bộ Việt Nam.
          </p>
        </div>
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <Package aria-hidden className="mb-3 size-5 text-primary" />
          <p className="font-semibold">Nhập thủ công nếu cần</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Không quét được? Nhập mã vạch in trên bao bì sản phẩm vào ô nhập
            bên dưới để tra cứu.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Receipt Mode Info Panel ────────────────────────────────

function ReceiptModeInfo() {
  return (
    <>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm font-medium text-primary shadow-sm">
        <QrCode aria-hidden className="size-4" />
        Quét hóa đơn
      </p>
      <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-normal sm:text-4xl">
        Thêm thực phẩm từ hóa đơn siêu thị
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        Quét mã QR trên hóa đơn mua sắm và Bếp An Tâm sẽ tự động nhận diện
        danh sách thực phẩm, giúp bạn thêm tất cả vào tủ lạnh số chỉ với một
        nút bấm.
      </p>

      <div className="mt-6 grid gap-3">
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <ShoppingCart aria-hidden className="mb-3 size-5 text-primary" />
          <p className="font-semibold">Thêm hàng loạt từ hóa đơn</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Không cần nhập từng món tay — quét QR một lần là hệ thống tự nhận
            diện tất cả sản phẩm đã mua.
          </p>
        </div>
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <Sparkles aria-hidden className="mb-3 size-5 text-primary" />
          <p className="font-semibold">Tự động đề xuất hạn dùng</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Hệ thống sẽ gợi ý ngày mở nắp và thời hạn tham chiếu dựa trên
            loại thực phẩm đã mua.
          </p>
        </div>
      </div>
    </>
  );
}
