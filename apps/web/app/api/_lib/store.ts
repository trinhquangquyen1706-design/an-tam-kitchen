/**
 * In-memory data store for Vercel serverless deployment.
 * Each cold start resets data, but within a warm instance data persists.
 * This is acceptable for the BKI demo.
 */

export type User = {
  id: string;
  email: string;
  name: string | null;
  password: string; // hashed
  refreshToken?: string | null;
  isGuest?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  company: string;
  daysBeforeOpen: number;
  daysAfterOpen: number;
  isGlobal: boolean;
  ownerId: string | null;
};

export type InventoryItem = {
  id: string;
  userId: string;
  userProductId: string;
  displayName: string;
  openedAt?: Date | string | null;
  expiryDate: Date | string;
  location: string;
  status: string;
  notes?: string | null;
  quantity?: string | null;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
};

// ── Global in-memory stores ──
const globalStore = globalThis as unknown as {
  __users?: User[];
  __products?: Product[];
  __inventory?: InventoryItem[];
};

export const users: User[] = globalStore.__users ??= [];
export const products: Product[] = globalStore.__products ??= [];
export const inventory: InventoryItem[] = globalStore.__inventory ??= [];
