import { db } from "./server/db.ts";
import { products, categories, brands } from "./shared/schema.ts";

async function createSampleData() {
  try {
    console.log("Creating sample categories and brands...");
    
    // Criar categorias de exemplo
    const [electronicsCategory] = await db.insert(categories).values({
      name: "Eletrônicos",
      slug: "eletronicos",
      description: "Produtos eletrônicos e tecnologia",
      tenantId: "default-tenant-001"
    }).returning();

    const [clothingCategory] = await db.insert(categories).values({
      name: "Roupas",
      slug: "roupas",
      description: "Vestuário e acessórios",
      tenantId: "default-tenant-001"
    }).returning();

    // Criar marcas de exemplo
    const [appleBrand] = await db.insert(brands).values({
      name: "Apple",
      slug: "apple",
      description: "Produtos Apple",
      tenantId: "default-tenant-001"
    }).returning();

    const [nikeBrand] = await db.insert(brands).values({
      name: "Nike",
      slug: "nike",
      description: "Produtos Nike",
      tenantId: "default-tenant-001"
    }).returning();

    console.log("Creating sample products...");

    // Criar produtos de exemplo para a Loja Demo
    const sampleProducts = [
      {
        name: "iPhone 15 Pro",
        description: "O mais novo iPhone com chip A17 Pro e câmera impressionante",
        price: "7999.99",
        stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        categoryId: electronicsCategory.id,
        brandId: appleBrand.id,
        tenantId: "default-tenant-001",
        slug: "iphone-15-pro",
        isActive: true
      },
      {
        name: "MacBook Air M3",
        description: "Notebook ultrafino com chip M3 e bateria de longa duração",
        price: "9999.99",
        stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
        categoryId: electronicsCategory.id,
        brandId: appleBrand.id,
        tenantId: "default-tenant-001",
        slug: "macbook-air-m3",
        isActive: true
      },
      {
        name: "Tênis Nike Air Max",
        description: "Tênis esportivo confortável e moderno",
        price: "399.99",
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        categoryId: clothingCategory.id,
        brandId: nikeBrand.id,
        tenantId: "default-tenant-001",
        slug: "tenis-nike-air-max",
        isActive: true
      },
      {
        name: "Camiseta Nike Dri-FIT",
        description: "Camiseta esportiva com tecnologia que absorve o suor",
        price: "89.99",
        stock: 100,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        categoryId: clothingCategory.id,
        brandId: nikeBrand.id,
        tenantId: "default-tenant-001",
        slug: "camiseta-nike-dri-fit",
        isActive: true
      }
    ];

    await db.insert(products).values(sampleProducts);

    // Criar produtos para a Loja Tech
    const techProducts = [
      {
        name: "Monitor 4K Gaming",
        description: "Monitor gamer 27 polegadas com taxa de atualização de 144Hz",
        price: "1299.99",
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
        categoryId: electronicsCategory.id,
        brandId: appleBrand.id,
        tenantId: "tech-store-002",
        slug: "monitor-4k-gaming",
        isActive: true
      },
      {
        name: "Teclado Mecânico RGB",
        description: "Teclado mecânico para gamers com iluminação RGB",
        price: "299.99",
        stock: 35,
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
        categoryId: electronicsCategory.id,
        brandId: appleBrand.id,
        tenantId: "tech-store-002",
        slug: "teclado-mecanico-rgb",
        isActive: true
      }
    ];

    await db.insert(products).values(techProducts);

    console.log("✅ Sample data created successfully!");
    console.log("- Created categories and brands");
    console.log("- Created 4 products for default-tenant-001 (Loja Demo)");
    console.log("- Created 2 products for tech-store-002 (Loja Tech)");

  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  } finally {
    process.exit(0);
  }
}

createSampleData();