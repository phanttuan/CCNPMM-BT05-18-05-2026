require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");

const categorySeeds = [
  { name: "Pin AA/AAA", slug: "pin-aa-aaa", description: "Pin thông dụng hằng ngày", icon: "🔋" },
  { name: "Pin Lithium", slug: "pin-lithium", description: "Pin lithium hiệu năng cao", icon: "⚡" },
  { name: "Pin Sạc", slug: "pin-sac", description: "Pin sạc dùng nhiều lần", icon: "🔌" },
  { name: "Pin Công Nghiệp", slug: "pin-cong-nghiep", description: "Pin cho thiết bị chuyên dụng", icon: "🏭" },
  { name: "Pin Đồng Hồ", slug: "pin-dong-ho", description: "Pin cúc áo cho đồng hồ", icon: "⌚" },
  { name: "Pin Máy Ảnh", slug: "pin-may-anh", description: "Pin cho máy ảnh, camera", icon: "📷" },
  { name: "Pin Xe Điện", slug: "pin-xe-dien", description: "Pin cho xe đạp/xe máy điện", icon: "🛵" },
  { name: "Phụ Kiện Sạc", slug: "phu-kien-sac", description: "Phụ kiện và bộ sạc pin", icon: "🧰" },
];

const brands = [
  "Duracell",
  "Energizer",
  "Panasonic",
  "Sony",
  "Samsung",
  "LG",
  "Varta",
  "Maxell",
  "Eneloop",
  "Xiaomi",
];

const batteryTypes = ["Lithium", "Alkaline", "NiMH", "Lead-acid", "Li-ion", "Khác"];
const voltages = ["1.2V", "1.5V", "3.0V", "3.7V", "6V", "12V", "24V", "48V"];
const capacities = ["220mAh", "500mAh", "1000mAh", "2000mAh", "3000mAh", "5000mAh", "10000mAh"];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = (arr) => arr[randomInt(0, arr.length - 1)];

const toSlug = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const buildProducts = (categories, totalProducts) => {
  const products = [];

  for (let i = 1; i <= totalProducts; i += 1) {
    const category = categories[(i - 1) % categories.length];
    const brand = randomPick(brands);
    const batteryType = randomPick(batteryTypes);
    const voltage = randomPick(voltages);
    const capacity = randomPick(capacities);
    const name = `${brand} ${category.name} ${batteryType} mẫu ${i}`;
    const price = randomInt(25000, 1800000);
    const discount = randomInt(0, 35);

    products.push({
      name,
      slug: `${toSlug(name)}-${i}`,
      description: `Sản phẩm ${name}, phù hợp cho nhiều nhu cầu sử dụng.`,
      price,
      discount,
      images: [
        `https://picsum.photos/seed/pin-${i}/640/480`,
        `https://picsum.photos/seed/pin-${i}-2/640/480`,
      ],
      stock: randomInt(0, 400),
      sold: randomInt(0, 2000),
      views: randomInt(0, 15000),
      category: category._id,
      brand,
      voltage,
      capacity,
      batteryType,
      isPromotion: discount >= 15,
      isFeatured: i % 15 === 0,
      isActive: true,
    });
  }

  return products;
};

const run = async () => {
  const totalProducts = Number(process.env.SEED_PRODUCTS || 480);
  const clearFirst = String(process.env.SEED_CLEAR_FIRST || "true") === "true";

  if (!process.env.MONGODB_URI) {
    throw new Error("Thiếu MONGODB_URI trong file .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Đã kết nối MongoDB");

  if (clearFirst) {
    await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);
    console.log("Đã xóa dữ liệu cũ (categories/products)");
  }

  const categories = await Category.insertMany(categorySeeds, { ordered: true });
  console.log(`Đã tạo ${categories.length} danh mục`);

  const products = buildProducts(categories, totalProducts);
  await Product.insertMany(products, { ordered: false });
  console.log(`Đã tạo ${products.length} sản phẩm`);

  await mongoose.connection.close();
  console.log("Seed hoàn tất");
};

run().catch(async (error) => {
  console.error("Seed thất bại:", error.message);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});
