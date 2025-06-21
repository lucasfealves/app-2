import {
  tenants,
  users,
  categories,
  brands,
  products,
  productVariants,
  carts,
  cartItems,
  orders,
  orderItems,
  payments,
  type Tenant,
  type InsertTenant,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Brand,
  type InsertBrand,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type Cart,
  type InsertCart,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, ilike, gte, lte, inArray, isNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Tenant operations
  getTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;

  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(tenantId?: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Brand operations
  getBrands(tenantId?: string): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Product operations
  getProducts(filters?: {
    tenantId?: string;
    categoryId?: number;
    brandId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: number, tenantId?: string): Promise<Product | undefined>;
  getProductBySlug(slug: string, tenantId?: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Product variant operations
  getProductVariants(productId: number): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;

  // Cart operations
  getUserCart(userId: string, tenantId?: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;

  // Order operations
  getOrders(filters?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Order item operations
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Payment operations
  getPayments(filters?: {
    orderId?: number;
    status?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;

  // Admin statistics
  getAdminStats(): Promise<{
    totalProducts: number;
    totalUsers: number;
    todayOrders: number;
    todayRevenue: string;
  }>;

    // Analytics
    getTopProducts(limit?: number): Promise<any[]>;
    getRevenueByCategory(): Promise<any[]>;

    // Auth methods
    createUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User>;
    getUserByEmail(email: string): Promise<User | undefined>;

  // User management
  getUsers(filters?: { limit?: number; offset?: number }): Promise<User[]>;
  updateUserStatus(userId: string, isBlocked: boolean): Promise<User | undefined>;

  // Tenant operations
  getTenants(filters?: { limit?: number; offset?: number }): Promise<Tenant[]>;
  getTenant(id: number): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Tenant operations
  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).where(eq(tenants.isActive, true));
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ ...tenant, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant;
  }

  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(tenantId?: string): Promise<Category[]> {
    if (tenantId) {
      return await db.select().from(categories).where(eq(categories.tenantId, tenantId));
    }
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Brand operations
  async getBrands(tenantId?: string): Promise<Brand[]> {
    if (tenantId) {
      return await db.select().from(brands).where(eq(brands.tenantId, tenantId));
    }
    return await db.select().from(brands);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  // Product operations
  async getProducts(filters?: {
    tenantId?: string;
    categoryId?: number;
    brandId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const conditions = [eq(products.isActive, true)];

    if (filters?.tenantId) {
      conditions.push(eq(products.tenantId, filters.tenantId));
    }

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters?.brandId) {
      conditions.push(eq(products.brandId, filters.brandId));
    }

    if (filters?.search) {
      conditions.push(ilike(products.name, `%${filters.search}%`));
    }

    if (filters?.minPrice) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }

    if (filters?.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }

    let query = db.select().from(products).where(and(...conditions));

    if (filters?.sortBy === 'price') {
      query = filters.sortOrder === 'desc' 
        ? query.orderBy(desc(products.price))
        : query.orderBy(products.price);
    } else if (filters?.sortBy === 'name') {
      query = filters.sortOrder === 'desc'
        ? query.orderBy(desc(products.name))
        : query.orderBy(products.name);
    } else {
      query = query.orderBy(desc(products.createdAt));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Product variant operations
  async getProductVariants(productId: number): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [newVariant] = await db.insert(productVariants).values(variant).returning();
    return newVariant;
  }

  // Cart operations
  async getUserCart(userId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const [newCart] = await db.insert(carts).values(cart).returning();
    return newCart;
  }

  async getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        variantId: cartItems.variantId,
        addedAt: cartItems.addedAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartItem.cartId),
          eq(cartItems.productId, cartItem.productId),
          cartItem.variantId ? eq(cartItems.variantId, cartItem.variantId) : eq(cartItems.variantId, null)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(cartId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    return result.rowCount >= 0;
  }

  // Order operations
  async getOrders(filters?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    let query = db.select().from(orders);

    if (filters?.userId) {
      query = query.where(eq(orders.userId, filters.userId));
    }

    if (filters?.status) {
      query = query.where(eq(orders.status, filters.status));
    }

    query = query.orderBy(desc(orders.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order item operations
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    return await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        variantId: orderItems.variantId,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  // Payment operations
  async getPayments(filters?: {
    orderId?: number;
    status?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }): Promise<Payment[]> {
    let query = db.select().from(payments);

    if (filters?.orderId) {
      query = query.where(eq(payments.orderId, filters.orderId));
    }

    if (filters?.status) {
      query = query.where(eq(payments.status, filters.status));
    }

    if (filters?.method) {
      query = query.where(eq(payments.method, filters.method));
    }

    query = query.orderBy(desc(payments.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Admin statistics
  async getAdminStats(): Promise<{
    totalProducts: number;
    totalUsers: number;
    todayOrders: number;
    todayRevenue: string;
  }> {
    const totalProducts = await db.$count(products, eq(products.isActive, true));
    const totalUsers = await db.$count(users, eq(users.isBlocked, false));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await db.$count(orders, 
      and(
        gte(orders.createdAt, today),
        lte(orders.createdAt, tomorrow)
      )
    );

    const todayRevenueResult = await db
      .select({
        total: orders.totalAmount
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, today),
          lte(orders.createdAt, tomorrow),
          eq(orders.status, 'completed')
        )
      );

    const todayRevenue = todayRevenueResult
      .reduce((sum, order) => sum + parseFloat(order.total), 0)
      .toFixed(2);

    return {
      totalProducts,
      totalUsers,
      todayOrders,
      todayRevenue,
    };
  }

    // Analytics
    async getTopProducts(limit: number = 5): Promise<any[]> {
      return [];
    }
    async getRevenueByCategory(): Promise<any[]> {
      return [];
    }

    async createUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User> {
        const userId = crypto.randomUUID();
        const [newUser] = await db.insert(users).values({ id: userId, ...userData }).returning();
        return newUser;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    }

  // User management
  async getUsers(filters?: { limit?: number; offset?: number }): Promise<User[]> {
    let query = db.select().from(users);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async updateUserStatus(userId: string, isBlocked: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isBlocked, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
}

// Export the simple storage implementation
export { storage } from "./storage-simple";