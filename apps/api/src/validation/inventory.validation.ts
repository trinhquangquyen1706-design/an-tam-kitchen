import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { StorageLocationEnum, FoodStatusEnum } from '@repo/types';

// ─── Param Schema ────────────────────────────────────────────────────────────

/**
 * Validates :id route param as UUID v7
 */
export const InventoryItemIdParamSchema = z.object({
  id: z.uuid({ message: 'ID vật phẩm phải là UUID hợp lệ' }),
});

// ─── Body Schemas ─────────────────────────────────────────────────────────────

/**
 * Schema cho POST /inventory - thêm mới vật phẩm vào kho
 */
export const CreateInventoryItemBodySchema = z.object({
  // Có thể gửi productId nếu chọn từ danh sách có sẵn
  productId: z.string().optional(),
  
  // Hoặc gửi name/category để backend tự tạo Product mới
  name: z.string().optional(),
  category: z.string().optional(),

  displayName: z.string().optional(),
  openedAt: z.coerce.date().nullable().optional(),
  expiryDate: z.coerce.date().optional(),
  location: StorageLocationEnum.optional(),
  storageLocation: z.string().optional(), // Frontend gửi field này thay vì location
  status: FoodStatusEnum.default('fresh'),
  notes: z.string().optional(),
  quantity: z.string().optional(),
}).refine(
  (data) => data.productId || (data.name && data.category),
  { message: 'Phải cung cấp productId hoặc (name và category) để định danh sản phẩm' }
);

/**
 * Schema cho PATCH /inventory/:id - cập nhật thông tin vật phẩm
 */
export const UpdateInventoryItemBodySchema = z.object({
  openedAt: z.coerce.date().nullable().optional(),
  expiryDate: z.coerce.date().optional(),
  location: StorageLocationEnum.optional(),
  status: FoodStatusEnum.optional(),
  notes: z.string().optional(),
  quantity: z.string().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Body cập nhật không được rỗng' }
);

export type CreateInventoryItemBody = z.infer<typeof CreateInventoryItemBodySchema>;
export type UpdateInventoryItemBody = z.infer<typeof UpdateInventoryItemBodySchema>;

// ─── Middleware Factories ─────────────────────────────────────────────────────

/**
 * Re-exporting validation logic if needed, or we can import from product.validation
 * To keep it clean, let's assume we can import from a shared utility or just copy for now
 * as per project pattern in product.validation.ts
 */

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateParams<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid params',
        details: result.error.issues,
      });
      return;
    }
    next();
  };
}
