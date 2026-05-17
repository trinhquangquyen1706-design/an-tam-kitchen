"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { format, subDays } from "date-fns";
import { AlertCircle, ArrowLeft, LoaderCircle, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FormFieldShell } from "@/components/foundation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isAuthError, getAuthErrorMessage } from "@/lib/api/client";
import type { AddFoodCategory, AddFoodStorageLocation } from "@/lib/api/types";
import { clearAuthHint, getAuthRequiredHref } from "@/lib/auth-session";
import { useAddInventoryItem } from "@/hooks/mutations/use-add-inventory-item";
import { toast } from "sonner";

import {
  CATEGORY_OPTIONS,
  STORAGE_LOCATION_OPTIONS,
} from "@repo/types";

// Các options đã được chuyển ra @repo/types

const addFoodFormSchema = z.object({
  name: z.string().trim().min(1, "Tên sản phẩm không được để trống."),
  category: z.string().min(1, "Vui lòng chọn nhóm thực phẩm."),
  openedAt: z
    .string()
    .min(1, "Ngày mở nắp là bắt buộc.")
    .refine((value) => !isFutureDate(value), {
      message: "Ngày mở nắp không được ở tương lai.",
    }),
  expiryDate: z.string().optional(),
  storageLocation: z.string().min(1, "Vui lòng chọn vị trí bảo quản."),
  notes: z.string().optional(),
});

type AddFoodFormValues = z.infer<typeof addFoodFormSchema>;

const defaultValues: AddFoodFormValues = {
  name: "",
  category: "",
  openedAt: "",
  expiryDate: "",
  storageLocation: "",
  notes: "",
};

export function AddFoodForm() {
  const router = useRouter();
  const addMutation = useAddInventoryItem();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<AddFoodFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(addFoodFormSchema),
  });
  const maxDate = format(new Date(), "yyyy-MM-dd");

  async function onSubmit(values: AddFoodFormValues) {
    const category = toAddFoodCategory(values.category);
    const storageLocation = toAddFoodStorageLocation(values.storageLocation);

    if (!category) {
      setError("category", { message: "Vui lòng chọn nhóm thực phẩm." });
      return;
    }

    if (!storageLocation) {
      setError("storageLocation", {
        message: "Vui lòng chọn vị trí bảo quản.",
      });
      return;
    }

    try {
      // Pillar 3: Use optimistic mutation hook
      await addMutation.mutateAsync({
        name: values.name,
        category,
        openedAt: values.openedAt,
        expiryDate: values.expiryDate || undefined,
        storageLocation,
        notes: values.notes || undefined,
      });

      // Navigate back — cache is already optimistically updated
      toast.success(`Đã thêm "${values.name}" vào tủ lạnh`, {
        description: "Danh sách đã được cập nhật.",
      });
      router.push("/dashboard");
    } catch (error) {
      if (isAuthError(error)) {
        clearAuthHint();
        setError("root", {
          type: "auth",
          message: getAuthErrorMessage(error),
        });
        return;
      }

      setError("root", {
        message:
          "Chưa thể lưu món này. Bạn thử lại sau ít phút hoặc kiểm tra kết nối nhé.",
      });
    }
  }

  function fillSampleProduct() {
    reset({
      name: "Sữa tươi Vinamilk",
      category: "milk",
      openedAt: format(subDays(new Date(), 4), "yyyy-MM-dd"),
      expiryDate: "",
      storageLocation: "fridge",
      notes: "",
    });
  }

  const isAuthRootError = errors.root?.type === "auth";
  const loginHref = getAuthRequiredHref("/foods/new");
  const isBusy = isSubmitting || addMutation.isPending;

  return (
    <form
      className="rounded-3xl border bg-background p-5 shadow-sm sm:p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      {errors.root?.message ? (
        <Alert className="mb-5 border-amber-200 bg-amber-50 text-amber-950">
          <AlertCircle aria-hidden={true} className="size-4" />
          <AlertTitle>Chưa lưu được thực phẩm</AlertTitle>
          <AlertDescription className="text-amber-900">
            {errors.root.message}
            {isAuthRootError ? (
              <div className="mt-3">
                <Button asChild className="rounded-2xl" size="sm">
                  <Link href={loginHref}>
                    <Lock aria-hidden={true} className="size-4" />
                    Đăng nhập
                  </Link>
                </Button>
              </div>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5">
        <FormFieldShell
          error={errors.name?.message}
          id="name"
          label="Tên sản phẩm"
          required
        >
          <Input
            aria-invalid={Boolean(errors.name)}
            autoComplete="off"
            className="h-11 rounded-2xl"
            id="name"
            placeholder="Ví dụ: Sữa tươi Vinamilk"
            {...register("name")}
          />
        </FormFieldShell>

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <FormFieldShell
                error={errors.category?.message}
                id="category"
                label="Nhóm thực phẩm"
                required
              >
                <Select
                  disabled={isBusy}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger
                    aria-invalid={Boolean(errors.category)}
                    className="h-11 w-full rounded-2xl"
                    id="category"
                  >
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormFieldShell>
            )}
          />

          <Controller
            control={control}
            name="storageLocation"
            render={({ field }) => (
              <FormFieldShell
                error={errors.storageLocation?.message}
                id="storageLocation"
                label="Vị trí bảo quản"
                required
              >
                <Select
                  disabled={isBusy}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger
                    aria-invalid={Boolean(errors.storageLocation)}
                    className="h-11 w-full rounded-2xl"
                    id="storageLocation"
                  >
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE_LOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormFieldShell>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormFieldShell
            error={errors.openedAt?.message}
            id="openedAt"
            label="Ngày mở nắp"
            required
          >
            <Input
              aria-invalid={Boolean(errors.openedAt)}
              className="h-11 rounded-2xl"
              id="openedAt"
              max={maxDate}
              type="date"
              {...register("openedAt")}
            />
          </FormFieldShell>

          <FormFieldShell
            description="Có thể bỏ trống nếu bạn chưa có thông tin trên bao bì."
            error={errors.expiryDate?.message}
            id="expiryDate"
            label="Hạn sử dụng in trên bao bì"
          >
            <Input
              aria-invalid={Boolean(errors.expiryDate)}
              className="h-11 rounded-2xl"
              id="expiryDate"
              type="date"
              {...register("expiryDate")}
            />
          </FormFieldShell>
        </div>

        <FormFieldShell
          error={errors.notes?.message}
          id="notes"
          label="Ghi chú"
        >
          <Textarea
            aria-invalid={Boolean(errors.notes)}
            className="min-h-24 rounded-2xl"
            id="notes"
            placeholder="Ví dụ: đã mở hộp, dùng cho bữa sáng"
            {...register("notes")}
          />
        </FormFieldShell>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          className="h-11 justify-center rounded-2xl"
          variant="outline"
        >
          <Link href="/dashboard">
            <ArrowLeft aria-hidden={true} className="size-4" />
            Quay lại tủ lạnh
          </Link>
        </Button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            className="h-11 justify-center rounded-2xl"
            disabled={isBusy}
            onClick={fillSampleProduct}
            type="button"
            variant="outline"
          >
            <Sparkles aria-hidden={true} className="size-4" />
            Dùng sản phẩm mẫu
          </Button>
          <Button
            className="h-11 justify-center rounded-2xl px-5"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? (
              <LoaderCircle
                aria-hidden={true}
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            ) : null}
            {isBusy ? "Đang lưu..." : "Lưu thực phẩm"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function isFutureDate(value: string) {
  const date = parseDateInput(value);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date.getTime() > today.getTime();
}

function parseDateInput(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toAddFoodCategory(value: string): AddFoodCategory | null {
  return CATEGORY_OPTIONS.some((option) => option.value === value)
    ? (value as AddFoodCategory)
    : null;
}

function toAddFoodStorageLocation(
  value: string
): AddFoodStorageLocation | null {
  return STORAGE_LOCATION_OPTIONS.some((option) => option.value === value)
    ? (value as AddFoodStorageLocation)
    : null;
}
