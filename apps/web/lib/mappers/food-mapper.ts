import {
  FoodCategoryEnum,
  FoodStatusEnum,
  StorageLocationEnum,
  type FoodCategory,
  type FoodStatus,
  type Product,
  type StorageLocation,
  type AddFoodCategory,
} from "@repo/types";
import { resolveFoodStatus } from "@/lib/food-rules";
import type {
  FoodApiRecord,
  FoodDataSource,
  FoodItemViewModel,
  FoodStatusMeta,
  FoodStatusSource,
} from "@/lib/api/types";

const LOCATION_LABELS: Record<StorageLocation, string> = {
  fridge: "Ngăn mát",
  freezer: "Ngăn đông",
  room_temp: "Nhiệt độ phòng",
};

const ADD_FOOD_CATEGORY_LABELS: Record<AddFoodCategory, string> = {
  milk: "Sữa",
  sauce: "Nước sốt / gia vị",
  canned_food: "Đồ hộp",
  sausage: "Xúc xích / đồ chế biến",
  drink: "Đồ uống",
  other: "Khác",
};

const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  dairy: "Sữa và sản phẩm từ sữa",
  meat_poultry: "Thịt / gia cầm",
  seafood: "Hải sản",
  vegetables: "Rau củ",
  fruits: "Trái cây",
  eggs: "Trứng",
  sauces_spices: "Nước sốt / gia vị",
  drinks: "Đồ uống",
  frozen_food: "Thực phẩm đông lạnh",
  snacks: "Đồ ăn vặt",
  others: "Khác",
};

const STATUS_META: Record<FoodStatus, Omit<FoodStatusMeta, "status">> = {
  fresh: {
    label: "Còn trong thời gian khuyến nghị",
    description: "Món này vẫn nằm trong mốc tham chiếu hiện có.",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  use_soon: {
    label: "Nên dùng sớm",
    description: "Nên ưu tiên dùng trong thời gian gần.",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
  },
  check_before_use: {
    label: "Nên kiểm tra kỹ",
    description: "Nên kiểm tra cảm quan và thông tin bao bì trước khi dùng.",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-800",
  },
  not_recommended: {
    label: "Không nên để quá lâu",
    description: "Mốc tham chiếu đã vượt quá khuyến nghị hiện có.",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export function mapFoodApiRecordToViewModel(
  record: FoodApiRecord,
  source: FoodDataSource = "api",
  now = new Date()
): FoodItemViewModel {
  const product = record.product ?? undefined;
  const expiryDate = toDate(readField(record, "expiryDate", "expiry_date"));
  const hasExplicitExpiryDate = readBooleanField(
    record,
    "hasExplicitExpiryDate",
    "has_explicit_expiry_date",
    Boolean(readField(record, "expiryDate", "expiry_date"))
  );
  const openedAt = toNullableDate(readField(record, "openedAt", "opened_at"));
  const createdAt = toDate(
    readField(record, "createdAt", "created_at"),
    new Date()
  );
  const updatedAt = toDate(
    readField(record, "updatedAt", "updated_at"),
    createdAt
  );
  const location = parseStorageLocation(record.location);
  const backendStatus = parseFoodStatus(record.status);
  const normalizedProduct = normalizeProduct(product);
  const status = resolveFoodStatus(
    {
      status: backendStatus,
      openedAt,
      expiryDate,
      product: normalizedProduct,
    },
    now
  );
  const statusSource: FoodStatusSource = backendStatus
    ? "backend"
    : "temporary_rule";
  const displayCategory = parseAddFoodCategory(
    readField(record, "displayCategory", "display_category")
  );
  const category = parseFoodCategory(product?.category);

  return {
    id: String(record.id ?? ""),
    userId: String(readField(record, "userId", "user_id") ?? ""),
    productId: String(readField(record, "productId", "product_id") ?? ""),
    displayName: String(
      readField(record, "displayName", "display_name") ??
        product?.name ??
        "Sản phẩm chưa đặt tên"
    ),
    productName: product?.name,
    category,
    categoryLabel: getCategoryLabel(displayCategory, category),
    company: product?.company,
    barcode: product?.barcode,
    imageUrl: product?.imageUrl,
    openedAt,
    expiryDate,
    hasExplicitExpiryDate,
    location,
    locationLabel: LOCATION_LABELS[location],
    status,
    statusMeta: getFoodStatusMeta(status),
    statusSource,
    statusSourceLabel:
      statusSource === "backend"
        ? "Trạng thái từ dữ liệu backend"
        : "Trạng thái ước tính từ thông tin bảo quản",
    statusExplanation: getStatusExplanation({
      statusSource,
      openedAt,
      expiryDate,
      hasExplicitExpiryDate,
      daysAfterOpen: normalizedProduct?.daysAfterOpen,
    }),
    notes: record.notes,
    quantity: record.quantity,
    createdAt,
    updatedAt,
    source,
  };
}

export function mapFoodApiRecordsToViewModels(
  records: FoodApiRecord[],
  source: FoodDataSource = "api",
  now = new Date()
) {
  return records.map((record) =>
    mapFoodApiRecordToViewModel(record, source, now)
  );
}

export function getFoodStatusMeta(status: FoodStatus): FoodStatusMeta {
  return {
    status,
    ...STATUS_META[status],
  };
}

function readField<T extends object>(
  record: T,
  camelCaseKey: keyof T,
  snakeCaseKey: keyof T
) {
  return record[camelCaseKey] ?? record[snakeCaseKey];
}

function readBooleanField<T extends object>(
  record: T,
  camelCaseKey: keyof T,
  snakeCaseKey: keyof T,
  fallback: boolean
) {
  const value = readField(record, camelCaseKey, snakeCaseKey);
  return typeof value === "boolean" ? value : fallback;
}

function parseFoodStatus(value: unknown): FoodStatus | undefined {
  const result = FoodStatusEnum.safeParse(value);
  return result.success ? result.data : undefined;
}

function parseStorageLocation(value: unknown): StorageLocation {
  const result = StorageLocationEnum.safeParse(value);
  return result.success ? result.data : "fridge";
}

function parseFoodCategory(value: unknown): FoodCategory | undefined {
  const result = FoodCategoryEnum.safeParse(value);
  return result.success ? result.data : undefined;
}

function parseAddFoodCategory(value: unknown): AddFoodCategory | undefined {
  if (
    value === "milk" ||
    value === "sauce" ||
    value === "canned_food" ||
    value === "sausage" ||
    value === "drink" ||
    value === "other"
  ) {
    return value;
  }

  return undefined;
}

function getCategoryLabel(
  displayCategory?: AddFoodCategory,
  category?: FoodCategory
) {
  if (displayCategory) return ADD_FOOD_CATEGORY_LABELS[displayCategory];
  if (category) return FOOD_CATEGORY_LABELS[category];
  return "Chưa phân nhóm";
}

function getStatusExplanation({
  statusSource,
  openedAt,
  expiryDate,
  hasExplicitExpiryDate,
  daysAfterOpen,
}: {
  statusSource: FoodStatusSource;
  openedAt?: Date | null;
  expiryDate: Date;
  hasExplicitExpiryDate: boolean;
  daysAfterOpen?: number;
}) {
  if (statusSource === "backend") {
    return "Hệ thống đã xác định trạng thái cho sản phẩm này dựa trên dữ liệu đã lưu.";
  }

  const ruleParts = [
    "Trạng thái được ước tính dựa trên thông tin bảo quản và ngày mở nắp.",
  ];

  if (openedAt) {
    ruleParts.push("Tính toán dựa trên ngày mở nắp và số ngày đã mở.");
  }

  if (daysAfterOpen !== undefined) {
    ruleParts.push(
      `Thời gian khuyến nghị sử dụng sau khi mở nắp: ${daysAfterOpen} ngày.`
    );
  }

  if (hasExplicitExpiryDate) {
    ruleParts.push(
      `Hạn sử dụng trên bao bì đang được ghi nhận là ${formatDateForExplanation(
        expiryDate
      )}.`
    );
  } else {
    ruleParts.push(
      "Chưa có thông tin hạn sử dụng trên bao bì, trạng thái được ước tính chủ yếu từ thời gian đã mở nắp."
    );
  }

  return ruleParts.join(" ");
}

function normalizeProduct(product?: Partial<Product> | null) {
  if (!product) return undefined;
  return {
    daysAfterOpen:
      typeof product.daysAfterOpen === "number" ? product.daysAfterOpen : 0,
  };
}

function toNullableDate(value: unknown): Date | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return toDate(value);
}

function toDate(value: unknown, fallback?: Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  if (fallback) return fallback;
  return new Date();
}

function formatDateForExplanation(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
