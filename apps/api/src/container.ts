import { prisma } from '@repo/database';
import {
  PrismaProductRepository,
  PrismaInventoryRepository,
  PrismaUserRepository,
  MockProductRepository,
  MockInventoryRepository,
  MockUserRepository,
  MockUserProductRepository,
  IProductRepository,
  IInventoryRepository,
  IUserRepository,
  IUserProductRepository,
  PrismaUserProductRepository
} from '@repo/repositories';
import { ProductController } from './controllers/product.controller.js';
import { InventoryController } from './controllers/inventory.controller.js';
import { UserProductController } from './controllers/user-product.controller.js';

// ─── Configuration ───────────────────────────────────────────────────────────
const useMock = process.env.USE_MOCK_DATA === 'true';

// ─── Repositories ────────────────────────────────────────────────────────────
export const productRepository: IProductRepository = useMock
  ? new MockProductRepository()
  : new PrismaProductRepository(prisma);

export const inventoryRepository: IInventoryRepository = useMock
  ? new MockInventoryRepository()
  : new PrismaInventoryRepository(prisma);

export const userRepository: IUserRepository = useMock
  ? new MockUserRepository()
  : new PrismaUserRepository(prisma);

export const userProductRepository: IUserProductRepository = useMock
  ? new MockUserProductRepository()
  : new PrismaUserProductRepository(prisma);

// ─── Controllers ─────────────────────────────────────────────────────────────
// Lưu ý: Chúng ta inject repository vào controller tại đây.
export const productController = new ProductController(productRepository);
export const inventoryController = new InventoryController(inventoryRepository, productRepository);
export const userProductController = new UserProductController(userProductRepository);
