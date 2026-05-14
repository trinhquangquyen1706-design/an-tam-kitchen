import type { ReactNode } from "react";
import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StateShellProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

function StateShell({
  icon,
  title,
  description,
  action,
  className,
}: StateShellProps) {
  return (
    <Card className={cn("border-dashed bg-card/80 shadow-sm", className)}>
      <CardContent className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center sm:px-8">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          {icon}
        </div>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

type BasicStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

type ErrorStateProps = BasicStateProps & {
  onRetry?: () => void;
  retryLabel?: string;
};

export function EmptyState({
  title = "Chưa có thực phẩm nào",
  description = "Khi bạn thêm thực phẩm, danh sách sẽ hiển thị ở đây.",
  className,
  children,
}: BasicStateProps & { children?: ReactNode }) {
  return (
    <StateShell
      action={children}
      className={className}
      description={description}
      icon={<Inbox aria-hidden="true" className="size-5" />}
      title={title}
    />
  );
}

export function LoadingState({
  title = "Đang tải dữ liệu",
  description = "Bếp An Tâm đang chuẩn bị thông tin mới nhất.",
  className,
}: BasicStateProps) {
  return (
    <StateShell
      className={className}
      description={description}
      icon={
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin motion-reduce:animate-none"
        />
      }
      title={title}
    />
  );
}

export function ErrorState({
  title = "Chưa tải được dữ liệu",
  description = "Đã xảy ra lỗi khi tải dữ liệu. Bạn có thể thử tải lại.",
  onRetry,
  retryLabel = "Tải lại",
  className,
}: ErrorStateProps) {
  return (
    <StateShell
      className={cn("border-amber-200 bg-amber-50/60", className)}
      description={description}
      icon={<AlertTriangle aria-hidden="true" className="size-5" />}
      title={title}
      action={
        onRetry ? (
          <Button onClick={onRetry} type="button" variant="outline">
            {retryLabel}
          </Button>
        ) : null
      }
    />
  );
}
