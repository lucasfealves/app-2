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
import { eq, and, desc, like, ilike, gte, lte, count, sql } from "drizzle-orm";

export class DatabaseStorage {
  // Tenant operations
  async getTenants(filters?: { limit?: number; offset?: number }): Promise<Tenant[]> {
    let query = db.select().from(tenants);

    query = query.orderBy(desc(tenants.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getTenant(id: number): Promise<Tenant | undefined> {
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

  async updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ ...tenant, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant;
  }

  async deleteTenant(id: number): Promise<boolean> {
    const result = await db.delete(tenants).where(eq(tenants.id, id));
    return result.rowCount > 0;
  }

  // User operations
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
    const [user] = await db
      .update(users)
      .set({ isBlocked, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

    let query = db.select().from(products);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add sorting
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

  async getProduct(id: number, tenantId?: string): Promise<Product | undefined> {
    const conditions = [eq(products.id, id)];
    if (tenantId) {
      conditions.push(eq(products.tenantId, tenantId));
    }
    
    const [product] = await db.select().from(products).where(and(...conditions));
    return product;
  }

  async getProductBySlug(slug: string, tenantId?: string): Promise<Product | undefined> {
    const conditions = [eq(products.slug, slug)];
    if (tenantId) {
      conditions.push(eq(products.tenantId, tenantId));
    }
    
    const [product] = await db.select().from(products).where(and(...conditions));
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
    const result = await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
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
  async getUserCart(userId: string, tenantId?: string): Promise<Cart | undefined> {
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
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          originalPrice: products.originalPrice,
          imageUrl: products.imageUrl,
          slug: products.slug,
          description: products.description,
          shortDescription: products.shortDescription,
          stock: products.stock,
          categoryId: products.categoryId,
          brandId: products.brandId,
          tenantId: products.tenantId,
          images: products.images,
          specifications: products.specifications,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [item] = await db.insert(cartItems).values(cartItem).returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(cartId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    return (result.rowCount || 0) > 0;
  }

  // Order operations
  async getOrders(filters?: {
    userId?: string;
    status?: string;
    tenantId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(orders.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status));
    }
    if (filters?.tenantId) {
      conditions.push(eq(orders.tenantId, filters.tenantId));
    }

    let query = db.select().from(orders);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
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
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
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
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          originalPrice: products.originalPrice,
          imageUrl: products.imageUrl,
          slug: products.slug,
          description: products.description,
          shortDescription: products.shortDescription,
          stock: products.stock,
          categoryId: products.categoryId,
          brandId: products.brandId,
          tenantId: products.tenantId,
          images: products.images,
          specifications: products.specifications,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        },
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(orderItem).returning();
    return item;
  }

  // Payment operations
  async getPayments(filters?: {
    orderId?: number;
    status?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }): Promise<Payment[]> {
    const conditions = [];
    
    if (filters?.orderId) {
      conditions.push(eq(payments.orderId, filters.orderId));
    }
    if (filters?.status) {
      conditions.push(eq(payments.status, filters.status));
    }
    if (filters?.method) {
      conditions.push(eq(payments.method, filters.method));
    }

    let query = db.select().from(payments);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
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
    const [payment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Admin statistics
  async getAdminStats(): Promise<{
    totalProducts: number;
    totalUsers: number;
    todayOrders: number;
    todayRevenue: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [productCount] = await db.select({ count: count() }).from(products).where(eq(products.isActive, true));
    const [userCount] = await db.select({ count: count() }).from(users);
    const [orderCount] = await db.select({ count: count() }).from(orders).where(gte(orders.createdAt, today));
    const [revenueResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(and(
        gte(orders.createdAt, today),
        eq(orders.status, 'completed')
      ));

    return {
      totalProducts: productCount.count,
      totalUsers: userCount.count,
      todayOrders: orderCount.count,
      todayRevenue: revenueResult.total || "0",
    };
  }

  async getTopProducts(limit: number = 5): Promise<any[]> {
    return await db
      .select({
        product: products,
        totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .groupBy(products.id)
      .orderBy(desc(sql`COALESCE(SUM(${orderItems.quantity}), 0)`))
      .limit(limit);
  }

  async getRevenueByCategory(): Promise<any[]> {
    return await db
      .select({
        categoryName: categories.name,
        revenue: sql<string>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .groupBy(categories.id, categories.name)
      .orderBy(desc(sql`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`));
  }
}

export const storage = new DatabaseStorage();