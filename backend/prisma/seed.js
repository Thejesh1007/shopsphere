const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── ADMIN USER ──
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shopsphere.com" },
    update: {},
    create: {
      email: "admin@shopsphere.com",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log("Admin created:", admin.email);

  // ── CATEGORIES ──
  const electronics = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: {
      name: "Electronics",
      description: "Gadgets, devices and accessories",
      imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    },
  });

  const clothing = await prisma.category.upsert({
    where: { name: "Clothing" },
    update: {},
    create: {
      name: "Clothing",
      description: "Fashion and apparel",
      imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
    },
  });

  const books = await prisma.category.upsert({
    where: { name: "Books" },
    update: {},
    create: {
      name: "Books",
      description: "Books and literature",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    },
  });

  const home = await prisma.category.upsert({
    where: { name: "Home & Kitchen" },
    update: {},
    create: {
      name: "Home & Kitchen",
      description: "Home essentials and kitchen tools",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    },
  });

  console.log("Categories created.");

  // ── PRODUCTS ──
  const products = [
    {
      name: "Wireless Bluetooth Headphones",
      description: "Premium noise-cancelling headphones with 30hr battery life.",
      price: 2999,
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      categoryId: electronics.id,
    },
    {
      name: "Mechanical Keyboard",
      description: "TKL mechanical keyboard with RGB backlight and blue switches.",
      price: 3499,
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1601445638532-1f2ced4a8ed8?w=400",
      categoryId: electronics.id,
    },
    {
      name: "Smartphone Stand",
      description: "Adjustable aluminium desk stand for phones and tablets.",
      price: 799,
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
      categoryId: electronics.id,
    },
    {
      name: "USB-C Hub 7-in-1",
      description: "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader.",
      price: 1499,
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400",
      categoryId: electronics.id,
    },
    {
      name: "Classic White T-Shirt",
      description: "100% cotton premium quality everyday white t-shirt.",
      price: 499,
      stock: 200,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      categoryId: clothing.id,
    },
    {
      name: "Slim Fit Chinos",
      description: "Comfortable slim fit chinos perfect for casual and formal wear.",
      price: 1299,
      stock: 80,
      imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
      categoryId: clothing.id,
    },
    {
      name: "Hooded Sweatshirt",
      description: "Warm fleece-lined hoodie available in multiple colors.",
      price: 999,
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400",
      categoryId: clothing.id,
    },
    {
      name: "Clean Code by Robert Martin",
      description: "A handbook of agile software craftsmanship.",
      price: 649,
      stock: 60,
      imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
      categoryId: books.id,
    },
    {
      name: "The Pragmatic Programmer",
      description: "Your journey to mastery — 20th anniversary edition.",
      price: 799,
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
      categoryId: books.id,
    },
    {
      name: "Atomic Habits",
      description: "An easy and proven way to build good habits and break bad ones.",
      price: 399,
      stock: 150,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      categoryId: books.id,
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "1 litre insulated bottle keeps drinks cold for 24hrs.",
      price: 599,
      stock: 90,
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
      categoryId: home.id,
    },
    {
      name: "Ceramic Coffee Mug Set",
      description: "Set of 4 minimalist ceramic mugs — 350ml each.",
      price: 849,
      stock: 70,
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400",
      categoryId: home.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`${products.length} products created.`);
  console.log("\nSeed complete!");
  console.log("Admin login: admin@shopsphere.com / Admin@123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });