import { Product, InventoryItem, User } from '@repo/types';
import { mockDatabase } from '@repo/database';
import { IProductRepository, IInventoryRepository, IUserRepository, IUserProductRepository } from './interfaces.js';

/**
 * Mock Product Repository
 */
export class MockProductRepository implements IProductRepository {
  private products: Product[] = [];

  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(), // Trong thực tế Zod v4 z.uuidv7() sẽ dùng ở đây
    } as Product;
    this.products.push(newProduct);
    return newProduct;
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length < initialLength;
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.products.find(p => p.barcode === barcode) || null;
  }

  async findByOwner(ownerId: string): Promise<Product[]> {
    return this.products.filter(p => p.ownerId === ownerId);
  }

  async findGlobal(): Promise<Product[]> {
    return this.products.filter(p => p.isGlobal);
  }
}

/**
 * Mock Inventory Repository
 */
export class MockInventoryRepository implements IInventoryRepository {
  private inventory: InventoryItem[] = mockDatabase.inventory;

  async create(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as InventoryItem;
    this.inventory.push(newItem);
    return newItem;
  }

  async findById(id: string): Promise<InventoryItem | null> {
    return this.inventory.find(item => item.id === id) || null;
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventory;
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const index = this.inventory.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Inventory item not found');
    
    this.inventory[index] = { ...this.inventory[index], ...data, updatedAt: new Date() };
    return this.inventory[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.inventory.length;
    this.inventory = this.inventory.filter(item => item.id !== id);
    return this.inventory.length < initialLength;
  }

  async findAllByUserId(userId: string): Promise<InventoryItem[]> {
    return this.inventory.filter(item => item.userId === userId);
  }

  async findByProduct(productId: string): Promise<InventoryItem[]> {
    return this.inventory.filter(item => item.userProductId === productId);
  }
}

/**
 * Mock User Repository
 */
export class MockUserRepository implements IUserRepository {
  private users: User[] = mockDatabase.users;

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    this.users.push(newUser);
    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = { ...this.users[index], ...data, updatedAt: new Date() };
    return this.users[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < initialLength;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }
}

export const userRepository = new MockUserRepository();

/**
 * Mock User Product Repository
 */
export class MockUserProductRepository implements IUserProductRepository {
  private userProducts: any[] = [];

  async create(data: {
    userId: string;
    name: string;
    category: string;
    storageLocation: string;
    note?: string;
  }): Promise<any> {
    const newProduct = {
      ...data,
      id: crypto.randomUUID(),
      company: 'Unknown',
      barcode: null,
      imageUrl: null,
      daysBeforeOpen: 30,
      daysAfterOpen: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userProducts.push(newProduct);
    return newProduct;
  }

  async findAllByUserId(userId: string): Promise<any[]> {
    return this.userProducts.filter(p => p.userId === userId);
  }

  async findById(id: string): Promise<any | null> {
    return this.userProducts.find(p => p.id === id) || null;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.userProducts.length;
    this.userProducts = this.userProducts.filter(p => p.id !== id);
    return this.userProducts.length < initialLength;
  }
}
