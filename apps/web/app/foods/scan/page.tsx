import type { Metadata } from "next";
import { QrCode, ShoppingCart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/foundation";
import { ScanReceiptFlow } from "@/components/food/scan-receipt-flow";

export const metadata: Metadata = {
  title: "Quét hóa đơn siêu thị | Bếp An Tâm",
  description:
    "Quét mã QR hóa đơn siêu thị để tự động thêm thực phẩm vào tủ lạnh số.",
};

export default function ScanReceiptPage() {
  return (
    <div className="min-h-dvh bg-card text-foreground">
      <AppHeader />

      <main className="py-6 sm:py-12">
        <div className="mx-auto grid max-w-5xl gap-5 px-4 sm:gap-6 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <section className="lg:pt-3">
            <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm font-medium text-primary shadow-sm">
              <QrCode aria-hidden={true} className="size-4" />
              Quét hóa đơn
            </p>
            <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-normal sm:text-4xl">
              Thêm thực phẩm từ hóa đơn siêu thị
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Quét mã QR trên hóa đơn mua sắm và Bếp An Tâm sẽ tự động nhận
              diện danh sách thực phẩm, giúp bạn thêm tất cả vào tủ lạnh số
              chỉ với một nút bấm.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border bg-background p-4 shadow-sm">
                <ShoppingCart
                  aria-hidden={true}
                  className="mb-3 size-5 text-primary"
                />
                <p className="font-semibold">Thêm hàng loạt từ hóa đơn</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Không cần nhập từng món tay — quét QR một lần là hệ thống
                  tự nhận diện tất cả sản phẩm đã mua.
                </p>
              </div>
              <div className="rounded-2xl border bg-background p-4 shadow-sm">
                <Sparkles
                  aria-hidden={true}
                  className="mb-3 size-5 text-primary"
                />
                <p className="font-semibold">Tự động đề xuất hạn dùng</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Hệ thống sẽ gợi ý ngày mở nắp và thời hạn tham chiếu dựa
                  trên loại thực phẩm đã mua.
                </p>
              </div>
            </div>
          </section>

          <ScanReceiptFlow />
        </div>
      </main>
    </div>
  );
}
