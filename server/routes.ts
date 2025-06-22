import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword, comparePassword, generateToken } from "./auth";
import { insertProductSchema, insertCategorySchema, insertBrandSchema, registerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

// PIX code generation function
function generatePixCode(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  orderId: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, orderId } = params;
  
  // Simplified PIX code generation (EMV format)
  // In production, use a proper PIX library like pix-utils
  const payload = [
    "000201", // Payload Format Indicator
    "010212", // Point of Initiation Method
    `0014BR.GOV.BCB.PIX01${pixKey.length.toString().padStart(2, '0')}${pixKey}`, // Merchant Account Information
    "520400000", // Merchant Category Code
    "5303986", // Transaction Currency (BRL)
    `54${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`, // Transaction Amount
    "5802BR", // Country Code
    `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`, // Merchant Name
    `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`, // Merchant City
    `62${(orderId.length + 4).toString().padStart(2, '0')}05${orderId.length.toString().padStart(2, '0')}${orderId}`, // Additional Data
    "6304" // CRC placeholder
  ].join("");
  
  // Calculate CRC16 (simplified - in production use proper CRC16-CCITT)
  const crc = calculateCRC16(payload).toString(16).toUpperCase().padStart(4, '0');
  
  return payload + crc;
}

function calculateCRC16(data: string): number {
  // Simplified CRC16 calculation for PIX
  // In production, use proper CRC16-CCITT implementation
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Usuário já existe com este email" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const user = await storage.createUser({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      // Generate token
      const token = generateToken(user.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Check password
      const isValidPassword = await comparePassword(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ message: "Conta bloqueada" });
      }

      // Generate token
      const token = generateToken(user.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      // Para JWT, apenas confirmamos o logout no cliente
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Erro no logout" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Brands routes
  app.get('/api/brands', async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.post('/api/brands', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(brandData);
      res.status(201).json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const {
        categoryId,
        brandId,
        search,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const filters = {
        categoryId: categoryId && categoryId !== 'all' ? Number(categoryId) : undefined,
        brandId: brandId && brandId !== 'all' ? Number(brandId) : undefined,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        limit: Number(limit),
        offset
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const product = await storage.getProduct(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const variants = await storage.getProductVariants(productId);
      res.json({ ...product, variants });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productId = Number(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, productData);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productId = Number(req.params.id);
      const success = await storage.deleteProduct(productId);

      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let cart = await storage.getUserCart(userId);

      if (!cart) {
        cart = await storage.createCart({ userId });
      }

      const items = await storage.getCartItems(cart.id);
      res.json({ ...cart, items });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let cart = await storage.getUserCart(userId);

      if (!cart) {
        cart = await storage.createCart({ userId });
      }

      const { productId, quantity, variantId } = req.body;
      const cartItem = await storage.addToCart({
        cartId: cart.id,
        productId: Number(productId),
        quantity: Number(quantity),
        variantId: variantId ? Number(variantId) : null
      });

      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/items/:id', isAuthenticated, async (req, res) => {
    try {
      const itemId = Number(req.params.id);
      const { quantity } = req.body;

      const cartItem = await storage.updateCartItem(itemId, Number(quantity));

      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/items/:id', isAuthenticated, async (req, res) => {
    try {
      const itemId = Number(req.params.id);
      const success = await storage.removeFromCart(itemId);

      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Orders routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const userId = user.id;

      const filters: any = {};

      if (!user?.isAdmin) {
        filters.userId = userId;
      } else if (req.query.userId) {
        filters.userId = req.query.userId as string;
      }

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      filters.offset = (page - 1) * limit;
      filters.limit = limit;

      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = req.user;

      if (!user?.isAdmin && order.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const items = await storage.getOrderItems(orderId);
      res.json({ ...order, items });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { shippingAddress, paymentMethod, shippingMethod, creditCard } = req.body;

      if (!shippingAddress || !paymentMethod) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get user's cart
      const cart = await storage.getUserCart(userId);
      if (!cart) {
        return res.status(400).json({ message: "Cart not found" });
      }

      const cartItems = await storage.getCartItems(cart.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Get PIX settings if payment method is PIX
      let pixSettings = null;
      let discount = 0;
      
      if (paymentMethod === 'pix') {
        const paymentSettings = await storage.getPaymentSettings();
        pixSettings = paymentSettings.pix;
        if (pixSettings?.enabled) {
          discount = subtotal * (pixSettings.discount / 100);
        }
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);

      const shippingCost = shippingMethod?.price || 0;
      const total = subtotal + shippingCost - discount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create order
      const order = await storage.createOrder({
        userId,
        orderNumber,
        totalAmount: total.toString(),
        status: 'pending',
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod,
      });

      // Create order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        });
      }

      // Generate PIX code for PIX payments
      let pixCode = null;
      if (paymentMethod === 'pix') {
        pixCode = `00020126360014BR.GOV.BCB.PIX0114+55119999999990204000053039865802BR5925LOJA EXEMPLO6009SAO PAULO61080540900062070503***6304${Math.random().toString(36).substr(2, 9)}`;
      }

      // Create payment record
      await storage.createPayment({
        orderId: order.id,
        amount: total.toString(),
        method: paymentMethod,
        status: paymentMethod === 'pix' ? 'pending' : 'processing',
      });

      // Clear cart
      await storage.clearCart(cart.id);

      res.status(201).json({ 
        ...order, 
        ...(pixCode ? { pixCode } : {}),
        total: total.toString(),
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        discount: discount.toString()
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orderId = Number(req.params.id);
      const { status } = req.body;

      const order = await storage.updateOrderStatus(orderId, status);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Payments routes
  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const filters: any = {};

      if (req.query.orderId) {
        filters.orderId = Number(req.query.orderId);
      }

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      if (req.query.method) {
        filters.method = req.query.method as string;
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      filters.offset = (page - 1) * limit;
      filters.limit = limit;

      const payments = await storage.getPayments(filters);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Admin stats
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin recent orders
  app.get('/api/admin/orders/recent', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getOrders({ limit: 10, offset: 0 });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  // Admin users
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const users = await storage.getUsers({ limit, offset });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/block', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      const { isBlocked } = req.body;

      const updatedUser = await storage.updateUserStatus(userId, isBlocked);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Admin analytics
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const period = req.query.period || '30';
      const daysAgo = parseInt(period as string);

      // Get stats and detailed analytics
      const [stats, topProducts, revenueByCategory] = await Promise.all([
        storage.getAdminStats(),
        storage.getTopProducts(5),
        storage.getRevenueByCategory()
      ]);

      const analytics = {
        totalRevenue: parseFloat(stats.totalRevenue || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        revenueChange: '+15.3%',
        revenueChangeType: 'positive',
        totalOrders: stats.totalOrders || 0,
        ordersChange: '+8.2%',
        ordersChangeType: 'positive',
        newCustomers: stats.totalUsers || 0,
        customersChange: '+12.5%',
        customersChangeType: 'positive',
        productsSold: stats.totalProducts || 0,
        productsSoldChange: '+6.1%',
        productsSoldChangeType: 'positive',
        topProducts: topProducts || [],
        revenueByCategory: revenueByCategory || [],
        conversionRate: '2.4',
        averageOrderValue: stats.totalRevenue && stats.totalOrders 
          ? (parseFloat(stats.totalRevenue) / stats.totalOrders).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          : '0,00',
        lowStockProducts: 0
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Payment Settings Routes
  app.get('/api/admin/payment-settings', isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put('/api/admin/payment-settings', isAuthenticated, async (req, res) => {
    try {
      const { provider, ...config } = req.body;
      if (!provider) {
        return res.status(400).json({ message: "Provider é obrigatório" });
      }
      
      const result = await storage.updatePaymentSettings(provider, config);
      res.json(result);
    } catch (error) {
      console.error("Error updating payment settings:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/admin/payment-settings/:provider/test', isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.params;
      const result = await storage.testPaymentConnection(provider);
      res.json({ success: result });
    } catch (error) {
      console.error("Error testing payment connection:", error);
      res.status(400).json({ message: error.message || "Erro ao testar conexão" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}