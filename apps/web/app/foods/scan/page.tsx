import type { Metadata } from "next";
import { ScanPageClient } from "./scan-page-client";
import { AppHeader } from "@/components/foundation";

export const metadata: Metadata = {
  title: "Quét thực phẩm & hóa đơn | Bếp An Tâm",
  description:
    "Quét mã vạch sản phẩm hoặc mã QR hóa đơn siêu thị để thêm thực phẩm vào tủ lạnh số.",
};

export default function ScanPage() {
  return (
    <div className="min-h-dvh bg-card text-foreground">
      <AppHeader />
      <main className="py-6 sm:py-12">
        <ScanPageClient />
      </main>
    </div>
  );
}
