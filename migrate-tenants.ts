import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { nanoid } from 'nanoid';
import { storage } from "./server/storage";

async function main() {
  console.log("Running tenant migration...");
  
  try {
    // Create default tenant
    const defaultTenant = await storage.createTenant({
      id: nanoid(),
      name: "Loja Demo",
      slug: "demo",
      description: "Loja de demonstração padrão",
      primaryColor: "#1f2937",
      secondaryColor: "#f3f4f6",
      isActive: true,
    });

    console.log(`✅ Default tenant created: ${defaultTenant.name}`);

    // Update existing users to belong to default tenant
    const users = await storage.getUsers();
    for (const user of users) {
      if (!user.tenantId) {
        await storage.updateUserTenant(user.id, defaultTenant.id);
      }
    }

    console.log("✅ Updated existing users with default tenant");

    // Update existing categories to belong to default tenant
    const categories = await storage.getCategories();
    for (const category of categories) {
      if (!category.tenantId) {
        await storage.updateCategoryTenant(category.id, defaultTenant.id);
      }
    }

    console.log("✅ Updated existing categories with default tenant");

    // Update existing brands to belong to default tenant
    const brands = await storage.getBrands();
    for (const brand of brands) {
      if (!brand.tenantId) {
        await storage.updateBrandTenant(brand.id, defaultTenant.id);
      }
    }

    console.log("✅ Updated existing brands with default tenant");

    // Update existing products to belong to default tenant
    const products = await storage.getProducts();
    for (const product of products) {
      if (!product.tenantId) {
        await storage.updateProductTenant(product.id, defaultTenant.id);
      }
    }

    console.log("✅ Updated existing products with default tenant");

    console.log("✅ Tenant migration completed successfully!");
  } catch (error) {
    console.error("❌ Error during tenant migration:", error);
    process.exit(1);
  }
}

main();