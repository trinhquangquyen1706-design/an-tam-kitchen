"use client";

import { useState } from "react";
import {
  Check,
  Plus,
  ScanLine,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Mock Shopping List Data ───────────────────────────────

type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  autoSuggested?: boolean;
};

const INITIAL_ITEMS: ShoppingItem[] = [
  {
    id: "s1",
    name: "Trứng gà ta",
    quantity: "1 vỉ (10 quả)",
    checked: false,
    autoSuggested: true,
  },
  {
    id: "s2",
    name: "Sữa tươi hữu cơ",
    quantity: "2 hộp 1 lít",
    checked: false,
    autoSuggested: true,
  },
  {
    id: "s3",
    name: "Cà chua bi",
    quantity: "500g",
    checked: false,
    autoSuggested: false,
  },
  {
    id: "s4",
    name: "Rau muống",
    quantity: "2 bó",
    checked: false,
    autoSuggested: true,
  },
  {
    id: "s5",
    name: "Thịt ba chỉ heo",
    quantity: "500g",
    checked: false,
    autoSuggested: false,
  },
];

const RECENTLY_BOUGHT: ShoppingItem[] = [
  { id: "rb1", name: "Nước mắm Phú Quốc", quantity: "1 chai", checked: true },
  { id: "rb2", name: "Dầu ăn hướng dương", quantity: "1 lít", checked: true },
  { id: "rb3", name: "Gạo tám thơm", quantity: "5 kg", checked: true },
];

// ═══════════════════════════════════════════════════════════
// SHOPPING LIST PAGE
// ═══════════════════════════════════════════════════════════

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>(INITIAL_ITEMS);
  const [newItemName, setNewItemName] = useState("");

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ShoppingItem = {
      id: `new-${Date.now()}`,
      name: newItemName.trim(),
      quantity: "1",
      checked: false,
    };
    setItems((prev) => [newItem, ...prev]);
    setNewItemName("");
  };

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Danh sách đi chợ thông minh
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tự động gợi ý từ thực phẩm đã hết hoặc chuẩn bị nấu ăn.
        </p>
      </div>

      {/* ═══ ACTION BAR ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Plus
            aria-hidden
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="h-11 rounded-xl pl-10"
            placeholder="+ Thêm nhanh món cần mua..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
        </div>
        <Button
          className="h-11 shrink-0 rounded-xl"
          onClick={addItem}
          disabled={!newItemName.trim()}
        >
          <Plus className="size-4" />
          Thêm
        </Button>
        <Button asChild variant="outline" className="h-11 shrink-0 rounded-xl">
          <Link href="/foods/scan">
            <ScanLine className="size-4" />
            Quét mã hóa đơn siêu thị
          </Link>
        </Button>
      </div>

      {/* ═══ WEEKLY CHECKLIST ═══ */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Mục cần mua hằng tuần</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {uncheckedItems.length} món còn lại cần mua
          </p>
        </div>

        <div className="divide-y">
          {uncheckedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/30"
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 transition-colors hover:border-primary dark:border-slate-600"
              >
                {item.checked && <Check className="size-4 text-primary" />}
              </button>

              {/* Name & quantity */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.quantity}</p>
              </div>

              {/* Auto-suggested badge */}
              {item.autoSuggested && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  <Sparkles className="size-3" />
                  Gợi ý tự động
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}

          {uncheckedItems.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              🎉 Bạn đã mua hết tất cả! Thêm món mới ở ô phía trên.
            </div>
          )}
        </div>
      </div>

      {/* ═══ CHECKED OFF / RECENTLY BOUGHT ═══ */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold text-foreground">
            Đã mua gần đây
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Các món đã hoàn thành trong tuần này
          </p>
        </div>

        <div className="divide-y">
          {[...checkedItems, ...RECENTLY_BOUGHT].map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-3.5 opacity-60"
            >
              {/* Checked checkbox */}
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-primary bg-primary/10">
                <Check className="size-4 text-primary" />
              </div>

              {/* Strikethrough name */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground line-through">
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
        Copyright © {new Date().getFullYear()} Bếp An Tâm. All rights reserved.
      </footer>
    </div>
  );
}
