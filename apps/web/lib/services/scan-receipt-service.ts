/**
 * Scan Receipt Service — call API scan-receipt
 */

import { apiRequest } from "@/lib/api/client";

export type ExpirySource = "manufacturer" | "estimated";

export type ScannedItem = {
  tempId: string;
  name: string;
  barcode?: string;
  category: string;
  storageLocation: string;
  quantity: number;
  price: number;
  daysAfterOpen: number;
  manufacturingDate?: string;
  suggestedOpenedAt: string;
  suggestedExpiryDate: string;
  expirySource?: ExpirySource;
};

export type ScanReceiptResponse = {
  receiptId: string;
  storeName: string;
  scannedAt: string;
  totalPrice: number;
  items: ScannedItem[];
};

export async function scanReceipt(
  receiptId: string
): Promise<ScanReceiptResponse> {
  const payload = await apiRequest<{ data: ScanReceiptResponse }>(
    "/api/inventory/scan-receipt",
    {
      method: "POST",
      body: { receiptId } as Record<string, unknown>,
    }
  );

  return (payload as any).data ?? payload;
}
