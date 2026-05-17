import { FileQuestion, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/foundation";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-card text-foreground">
      <AppHeader />

      <main className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-muted">
          <FileQuestion className="size-12 text-muted-foreground/40" />
        </div>

        <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground">
          404
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Trang bạn tìm kiếm không tồn tại
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
          Có thể trang này đã được di chuyển hoặc bạn đã nhập sai đường dẫn.
        </p>

        <div className="mt-8 flex gap-3">
          <Button asChild className="h-11 rounded-2xl px-6">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Về trang chủ
            </Link>
          </Button>
          <Button asChild className="h-11 rounded-2xl px-6" variant="outline">
            <Link href="/foods/scan">Quét thực phẩm</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
