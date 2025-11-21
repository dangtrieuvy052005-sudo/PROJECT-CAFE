// File: prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

  // 1. Tạo Danh mục (Category)
  const cafeCategory = await prisma.category.create({
    data: {
      name: 'Cà phê máy',
      displayOrder: 1,
    },
  });

  // 2. Tạo Sản phẩm (Product)
  const bacXiu = await prisma.product.create({
    data: {
      name: 'Bạc Xỉu Đá',
      categoryId: cafeCategory.id,
      basePrice: 29000,
      imageUrl: 'https://via.placeholder.com/150',
      isActive: true,
    },
  });

  // 3. Tạo Biến thể (Variant - SKU)
  const variantM = await prisma.productVariant.create({
    data: {
      productId: bacXiu.id,
      name: 'Size M',
      skuCode: 'CF-BX-M', // Mã SKU quản lý kho
      priceAdjustment: 0, // Giá gốc
    },
  });

  const variantL = await prisma.productVariant.create({
    data: {
      productId: bacXiu.id,
      name: 'Size L',
      skuCode: 'CF-BX-L',
      priceAdjustment: 6000, // Thêm 6k
    },
  });

  // 4. Tạo Nguyên liệu (Ingredient) cho kho
  const milk = await prisma.ingredient.create({
    data: {
      name: 'Sữa tươi Vinamilk',
      unit: 'ml', // Đơn vị dùng
      storageUnit: 'thùng', // Đơn vị nhập
      conversionRate: 1000, // 1 thùng = 1000ml (giả lập)
      costPrice: 30, // 30đ/ml
      currentStock: 50000, // Tồn 50 lít
      minStockAlert: 2000,
    },
  });

  const coffeeBean = await prisma.ingredient.create({
    data: {
      name: 'Hạt Arabica Cầu Đất',
      unit: 'g',
      storageUnit: 'kg',
      conversionRate: 1000,
      costPrice: 250, // 250đ/g
      currentStock: 10000, // Tồn 10kg
      minStockAlert: 1000,
    },
  });

  // 5. Tạo Công thức (Recipe) - Định lượng
  // 1 ly Bạc Xỉu Size M cần 20g Cafe + 100ml Sữa
  await prisma.recipe.create({
    data: {
      productVariantId: variantM.id,
      ingredientId: coffeeBean.id,
      quantityNeeded: 20, // 20g
    },
  });

  await prisma.recipe.create({
    data: {
      productVariantId: variantM.id,
      ingredientId: milk.id,
      quantityNeeded: 100, // 100ml
    },
  });

  console.log(`✅ Đã tạo dữ liệu mẫu:
  - Product: ${bacXiu.name}
  - Variant ID: ${variantM.id} (Size M), ${variantL.id} (Size L)
  - Kho: Cafe & Sữa tươi`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
