import { Request, Response } from 'express';
import { IInventoryRepository, IProductRepository } from '@repo/repositories';
import { CreateInventoryItemBody, UpdateInventoryItemBody } from '../validation/inventory.validation.js';
import { FoodCategory } from '@repo/types';

/**
 * InventoryController
 * 
 * Quản lý kho thực phẩm của người dùng.
 * Mọi DB operation đều đi qua IInventoryRepository.
 */
export class InventoryController {
  constructor(
    private readonly inventoryRepo: IInventoryRepository,
    private readonly productRepo: IProductRepository
  ) {}

  // ─── POST /inventory ──────────────────────────────────────────────────────
  
  /**
   * Tạo mới một vật phẩm trong kho.
   * Hỗ trợ tạo Product "on-the-fly" nếu chỉ gửi name/category.
   */
  create = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Thiếu thông tin người dùng' });
      }

      const body: CreateInventoryItemBody & {
        name?: string;
        category?: string;
        storageLocation?: string;
      } = req.body;
      let productId = body.productId;

      // Frontend gửi `storageLocation`, backend dùng `location`
      const location = body.location || body.storageLocation || 'fridge';

      // Logic "Smart Create": Nếu không có productId, tạo Product mới
      if (!productId && body.name && body.category) {
        const newProduct = await this.productRepo.create({
          name: body.name,
          category: body.category as FoodCategory, // Đổi từ FoodCategory về category
          company: 'Unknown',
          daysBeforeOpen: 30,
          daysAfterOpen: 7,
          isGlobal: false,
          ownerId: userId,
        });
        productId = newProduct.id;
      }

      if (!productId) {
        return res.status(400).json({ error: 'Không thể xác định Product ID' });
      }

      // Đảm bảo expiryDate là Date (mặc định +1 năm nếu không có)
      const expiryDate = body.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const newItem = await this.inventoryRepo.create({
        userId,
        userProductId: productId,
        displayName: body.displayName || body.name || 'Sản phẩm mới',
        openedAt: body.openedAt,
        expiryDate,
        location: location as any,
        status: body.status || 'fresh',
        notes: body.notes,
        quantity: body.quantity,
      });

      return res.status(201).json({ data: newItem });
    } catch (error) {
      console.error('[InventoryController.create]', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  };

  // ─── GET /inventory ───────────────────────────────────────────────────────
  
  /**
   * Liệt kê tất cả vật phẩm trong kho của người dùng hiện tại.
   */
  getAll = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Thiếu thông tin người dùng' });
      }

      const items = await this.inventoryRepo.findAllByUserId(userId);
      const enrichedItems = await this.enrichWithProducts(items);
      return res.status(200).json({ data: enrichedItems, count: enrichedItems.length });
    } catch (error) {
      console.error('[InventoryController.getAll]', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  };

  // ─── GET /inventory/:id ────────────────────────────────────────────────────
  
  /**
   * Lấy chi tiết một vật phẩm trong kho.
   */
  getById = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params as { id: string };
      const userId = (req as any).userId;

      const item = await this.inventoryRepo.findById(id);
      if (!item) {
        return res.status(404).json({ error: `Không tìm thấy vật phẩm với id: ${id}` });
      }

      // Đảm bảo người dùng chỉ xem được vật phẩm của mình
      if (item.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Bạn không có quyền truy cập vật phẩm này' });
      }

      const enriched = await this.enrichWithProduct(item);
      return res.status(200).json({ data: enriched });
    } catch (error) {
      console.error('[InventoryController.getById]', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  };

  // ─── PATCH /inventory/:id ─────────────────────────────────────────────────
  
  /**
   * Cập nhật số lượng, trạng thái, hoặc ngày mở nắp của vật phẩm.
   */
  update = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params as { id: string };
      const body: UpdateInventoryItemBody = req.body;
      const userId = (req as any).userId;

      const existing = await this.inventoryRepo.findById(id);
      if (!existing) {
        return res.status(404).json({ error: `Không tìm thấy vật phẩm với id: ${id}` });
      }

      // Đảm bảo người dùng chỉ có thể cập nhật vật phẩm của chính họ
      if (existing.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Bạn không có quyền truy cập vật phẩm này' });
      }

      const updated = await this.inventoryRepo.update(id, body);
      return res.status(200).json({ data: updated });
    } catch (error) {
      console.error('[InventoryController.update]', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  };

  // ─── DELETE /inventory/:id ────────────────────────────────────────────────
  
  /**
   * Xóa vật phẩm khỏi kho.
   */
  delete = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params as { id: string };
      const userId = (req as any).userId;

      const existing = await this.inventoryRepo.findById(id);
      if (!existing) {
        return res.status(404).json({ error: `Không tìm thấy vật phẩm với id: ${id}` });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Bạn không có quyền truy cập vật phẩm này' });
      }

      await this.inventoryRepo.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('[InventoryController.delete]', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  };

  // ─── POST /inventory/scan-receipt ──────────────────────────────────────────

  /**
   * Giả lập quét QR hóa đơn siêu thị.
   * Nhận receiptId → trả về danh sách thực phẩm mock.
   */
  scanReceipt = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { receiptId } = req.body as { receiptId?: string };
      if (!receiptId) {
        return res.status(400).json({ error: 'Thiếu mã hóa đơn (receiptId)' });
      }

      // ── Mock database thực phẩm siêu thị (with real-ish barcodes) ──
      const MOCK_PRODUCTS = [
        { name: 'Thịt heo xay',           barcode: '8935049501237', category: 'other',   location: 'fridge',  daysAfterOpen: 2,   shelfLifeDays: 5,   price: 65000 },
        { name: 'Sữa tươi TH True Milk',  barcode: '8935217400150', category: 'milk',    location: 'fridge',  daysAfterOpen: 5,   shelfLifeDays: 45,  price: 32000 },
        { name: 'Rau cải bó xôi',         barcode: '8938503221014', category: 'other',   location: 'fridge',  daysAfterOpen: 3,   shelfLifeDays: 7,   price: 18000 },
        { name: 'Xúc xích Đức Việt',      barcode: '8936006760017', category: 'sausage', location: 'fridge',  daysAfterOpen: 7,   shelfLifeDays: 90,  price: 45000 },
        { name: 'Tương ớt Chinsu',         barcode: '8934804001012', category: 'sauce',   location: 'room',    daysAfterOpen: 30,  shelfLifeDays: 365, price: 22000 },
        { name: 'Nước cam Tropicana',      barcode: '8934680033213', category: 'drink',   location: 'fridge',  daysAfterOpen: 5,   shelfLifeDays: 120, price: 38000 },
        { name: 'Cá hồi phi lê',          barcode: '8936190991234', category: 'other',   location: 'freezer', daysAfterOpen: 2,   shelfLifeDays: 14,  price: 120000 },
        { name: 'Phô mai Con Bò Cười',    barcode: '8934680011419', category: 'milk',    location: 'fridge',  daysAfterOpen: 14,  shelfLifeDays: 180, price: 55000 },
        { name: 'Đậu hũ non Vinasoy',     barcode: '8934561088018', category: 'other',   location: 'fridge',  daysAfterOpen: 2,   shelfLifeDays: 30,  price: 12000 },
        { name: 'Nước mắm Phú Quốc',      barcode: '8936007000082', category: 'sauce',   location: 'room',    daysAfterOpen: 180, shelfLifeDays: 730, price: 42000 },
      ];

      // Chọn ngẫu nhiên 3-5 items dựa trên receiptId (deterministic seed)
      const seed = receiptId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const count = 3 + (seed % 3); // 3, 4, or 5 items
      const shuffled = [...MOCK_PRODUCTS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);

      const now = new Date();
      const items = selected.map((p, i) => {
        // Simulate manufacturing date = random 1-14 days ago
        const mfgDaysAgo = 1 + (seed + i) % 14;
        const manufacturingDate = new Date(now.getTime() - mfgDaysAgo * 86400000);
        // Exact expiry from manufacturer
        const exactExpiryDate = new Date(manufacturingDate.getTime() + p.shelfLifeDays * 86400000);

        return {
          tempId: `receipt-${receiptId}-${i}`,
          name: p.name,
          barcode: p.barcode,
          category: p.category,
          storageLocation: p.location,
          quantity: 1,
          price: p.price,
          daysAfterOpen: p.daysAfterOpen,
          manufacturingDate: manufacturingDate.toISOString().split('T')[0],
          suggestedOpenedAt: now.toISOString().split('T')[0],
          suggestedExpiryDate: exactExpiryDate.toISOString().split('T')[0],
          expirySource: 'manufacturer' as const, // 'manufacturer' = chính xác | 'estimated' = ước lượng
        };
      });

      const totalPrice = items.reduce((sum, item) => sum + (item.price ?? 0), 0);

      return res.status(200).json({
        data: {
          receiptId,
          storeName: receiptId.startsWith('COOP') ? 'Co.op Mart' :
                     receiptId.startsWith('BACH') ? 'Bách Hóa Xanh' :
                     receiptId.startsWith('WIN')  ? 'WinMart' : 'Siêu thị',
          scannedAt: now.toISOString(),
          totalPrice,
          items,
        },
      });
    } catch (error) {
      console.error('[InventoryController.scanReceipt]', error);
      return res.status(500).json({ error: 'Lỗi xử lý hóa đơn' });
    }
  };

  private async enrichWithProduct(item: any) {
    try {
      const product = await this.productRepo.findById(item.userProductId);
      return { ...item, product: product ?? undefined };
    } catch {
      return item;
    }
  }

  private async enrichWithProducts(items: any[]) {
    return Promise.all(items.map(item => this.enrichWithProduct(item)));
  }
}
