import { db } from "./server/db";
import { tenants, users, categories, brands, products } from "./shared/schema";
import { eq, isNull } from "drizzle-orm";

async function main() {
  console.log("Running tenant migration...");
  
  try {
    // Check if default tenant exists, create if not
    let defaultTenant = await db.select().from(tenants).where(eq(tenants.slug, "demo")).limit(1);
    
    if (defaultTenant.length === 0) {
      const [newTenant] = await db.insert(tenants).values({
        name: "Loja Demo",
        slug: "demo",
        description: "Loja de demonstração padrão",
        isActive: true,
      }).returning();
      defaultTenant = [newTenant];
      console.log(`✅ Default tenant created: ${newTenant.name} (ID: ${newTenant.id})`);
    } else {
      console.log(`✅ Default tenant exists: ${defaultTenant[0].name} (ID: ${defaultTenant[0].id})`);
    }

    const tenant = defaultTenant[0];

    // Update existing users to belong to default tenant
    await db.update(users)
      .set({ tenantId: tenant.id })
      .where(isNull(users.tenantId));

    console.log("✅ Updated existing users with default tenant");

    // Update existing categories to belong to default tenant
    await db.update(categories)
      .set({ tenantId: tenant.id })
      .where(isNull(categories.tenantId));

    console.log("✅ Updated existing categories with default tenant");

    // Update existing brands to belong to default tenant
    await db.update(brands)
      .set({ tenantId: tenant.id })
      .where(isNull(brands.tenantId));

    console.log("✅ Updated existing brands with default tenant");

    console.log("✅ Tenant migration completed successfully!");
  } catch (error) {
    console.error("❌ Error during tenant migration:", error);
    process.exit(1);
  }
}

main();