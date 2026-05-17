/**
 * Barcode Lookup Service — look up real product info from barcode/QR
 *
 * Uses Open Food Facts API (free, open-source, no API key required)
 * Falls back to a local Vietnamese product database for common items.
 */

export type BarcodeProduct = {
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  storageLocation: string;
  imageUrl?: string;
  quantity?: string;
  /** Shelf life in days after opening (estimated) */
  daysAfterOpen: number;
  source: "openfoodfacts" | "local_db" | "raw_barcode";
};

// ─── Local Vietnamese product database ─────────────────────
// Common products at Vietnamese supermarkets with their barcodes

const LOCAL_PRODUCTS: Record<string, Omit<BarcodeProduct, "barcode">> = {
  // TH True Milk
  "8935217400010": {
    name: "Sữa tươi TH True Milk có đường",
    brand: "TH True Milk",
    category: "milk",
    storageLocation: "fridge",
    daysAfterOpen: 3,
    source: "local_db",
  },
  "8935217400027": {
    name: "Sữa tươi TH True Milk không đường",
    brand: "TH True Milk",
    category: "milk",
    storageLocation: "fridge",
    daysAfterOpen: 3,
    source: "local_db",
  },
  // Vinamilk
  "8934673583220": {
    name: "Sữa tươi Vinamilk 100% có đường",
    brand: "Vinamilk",
    category: "milk",
    storageLocation: "fridge",
    daysAfterOpen: 3,
    source: "local_db",
  },
  "8934673583237": {
    name: "Sữa tươi Vinamilk 100% không đường",
    brand: "Vinamilk",
    category: "milk",
    storageLocation: "fridge",
    daysAfterOpen: 3,
    source: "local_db",
  },
  // Mì tôm
  "8934563238018": {
    name: "Mì Hảo Hảo tôm chua cay",
    brand: "Acecook",
    category: "other",
    storageLocation: "room",
    daysAfterOpen: 1,
    source: "local_db",
  },
  // Nước mắm
  "8934804032016": {
    name: "Nước mắm Nam Ngư đệ nhị",
    brand: "Masan",
    category: "sauce",
    storageLocation: "room",
    daysAfterOpen: 90,
    source: "local_db",
  },
  // Coca-Cola
  "5449000000996": {
    name: "Coca-Cola lon 330ml",
    brand: "Coca-Cola",
    category: "drink",
    storageLocation: "fridge",
    daysAfterOpen: 1,
    source: "local_db",
  },
  // Pepsi
  "8934588012013": {
    name: "Pepsi lon 330ml",
    brand: "PepsiCo",
    category: "drink",
    storageLocation: "fridge",
    daysAfterOpen: 1,
    source: "local_db",
  },
};

// ─── Category mapping from Open Food Facts ─────────────────

function mapOFFCategory(categories: string): string {
  const lower = categories.toLowerCase();
  if (lower.includes("milk") || lower.includes("dairy") || lower.includes("sữa"))
    return "milk";
  if (lower.includes("sauce") || lower.includes("condiment") || lower.includes("nước mắm"))
    return "sauce";
  if (lower.includes("meat") || lower.includes("sausage") || lower.includes("thịt"))
    return "sausage";
  if (lower.includes("canned") || lower.includes("đồ hộp"))
    return "canned_food";
  if (lower.includes("beverage") || lower.includes("drink") || lower.includes("nước"))
    return "drink";
  return "other";
}

function estimateDaysAfterOpen(category: string): number {
  switch (category) {
    case "milk": return 3;
    case "sauce": return 60;
    case "sausage": return 5;
    case "canned_food": return 3;
    case "drink": return 1;
    default: return 7;
  }
}

function estimateStorage(category: string): string {
  switch (category) {
    case "milk":
    case "sausage":
    case "drink":
      return "fridge";
    case "sauce":
    case "canned_food":
    case "other":
      return "room";
    default:
      return "fridge";
  }
}

// ─── Main lookup function ──────────────────────────────────

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct> {
  // 1. Check local DB first (instant, no network)
  const localMatch = LOCAL_PRODUCTS[barcode];
  if (localMatch) {
    return { barcode, ...localMatch };
  }

  // 2. Try Open Food Facts API
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const name =
          p.product_name_vi ||
          p.product_name ||
          p.generic_name ||
          `Sản phẩm ${barcode}`;
        const categories = p.categories || "";
        const category = mapOFFCategory(categories);

        return {
          barcode,
          name,
          brand: p.brands || undefined,
          category,
          storageLocation: estimateStorage(category),
          imageUrl: p.image_front_small_url || p.image_url || undefined,
          quantity: p.quantity || undefined,
          daysAfterOpen: estimateDaysAfterOpen(category),
          source: "openfoodfacts",
        };
      }
    }
  } catch {
    // Network error or timeout — fall through to raw barcode
  }

  // 3. Fallback: return raw barcode as product
  return {
    barcode,
    name: `Sản phẩm mã ${barcode}`,
    category: "other",
    storageLocation: "fridge",
    daysAfterOpen: 7,
    source: "raw_barcode",
  };
}
