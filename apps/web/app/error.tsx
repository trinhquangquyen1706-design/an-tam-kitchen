"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-destructive/10">
        <AlertTriangle className="size-10 text-destructive" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold text-foreground">
        Đã xảy ra lỗi
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Rất tiếc, có lỗi xảy ra khi tải trang này. Vui lòng thử lại hoặc quay
        về trang chủ.
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground/60">
          Mã lỗi: {error.digest}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <Button
          className="h-11 rounded-2xl px-6"
          onClick={reset}
          type="button"
        >
          <RotateCcw className="size-4" />
          Thử lại
        </Button>
        <Button
          asChild
          className="h-11 rounded-2xl px-6"
          variant="outline"
        >
          <a href="/">Về trang chủ</a>
        </Button>
      </div>
    </div>
  );
}
