import express, { Router } from 'express';
import { inventoryController } from '../container.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  CreateInventoryItemBodySchema,
  UpdateInventoryItemBodySchema,
  InventoryItemIdParamSchema,
} from '../validation/inventory.validation.js';


const router: Router = express.Router();

// Áp dụng xác thực cho tất cả các route trong inventory
router.use(authenticate);

/**
 * POST /inventory
 * Thêm mới vật phẩm vào kho của người dùng.
 */
router.post(
  '/',
  validateBody(CreateInventoryItemBodySchema),
  inventoryController.create
);

/**
 * POST /inventory/scan-receipt
 * Quét QR hóa đơn siêu thị → trả về danh sách thực phẩm mock.
 */
router.post(
  '/scan-receipt',
  inventoryController.scanReceipt
);

/**
 * GET /inventory
 * Lấy danh sách vật phẩm trong kho của người dùng hiện tại.
 */
router.get(
  '/',
  inventoryController.getAll
);

/**
 * GET /inventory/:id
 * Lấy chi tiết một vật phẩm theo ID.
 */
router.get(
  '/:id',
  validateParams(InventoryItemIdParamSchema),
  inventoryController.getById
);

/**
 * PATCH /inventory/:id
 * Cập nhật thông tin vật phẩm (số lượng, ngày mở, trạng thái).
 */
router.patch(
  '/:id',
  validateParams(InventoryItemIdParamSchema),
  validateBody(UpdateInventoryItemBodySchema),
  inventoryController.update
);

/**
 * DELETE /inventory/:id
 * Xóa vật phẩm khỏi kho.
 */
router.delete(
  '/:id',
  validateParams(InventoryItemIdParamSchema),
  inventoryController.delete
);

export default router;
